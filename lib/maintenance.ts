import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import { ensureOnboarding } from "@/lib/onboarding";
import { messagingStatus } from "@/lib/messaging";

export type MaintenanceItem = {
  type: string; // Maschinen-Key (Frontend übersetzt über de.json)
  severity: "ok" | "warn" | "error";
  count: number;
  autoFixable: boolean;
};

export type MaintenanceResult = {
  status: "ok" | "warn" | "error";
  dryRun: boolean;
  items: MaintenanceItem[];
  repairedTotal: number;
};

type WaitlistRow = {
  id: string;
  practice_id: string | null;
  patient_id: string | null;
  created_at: string | null;
};

async function logEntry(
  admin: SupabaseClient,
  entry: {
    problem_type: string;
    affected_table?: string;
    action: string;
    result: string;
    dry_run: boolean;
    error_message?: string | null;
  },
) {
  try {
    await admin.from("maintenance_logs").insert({
      problem_type: entry.problem_type,
      affected_table: entry.affected_table ?? null,
      action: entry.action,
      result: entry.result,
      dry_run: entry.dry_run,
      error_message: entry.error_message ?? null,
    });
  } catch (err) {
    console.error("[maintenance] Log-Eintrag fehlgeschlagen:", err);
  }
}

// Führt sichere Prüfungen (dryRun=true) bzw. Reparaturen (dryRun=false) durch.
// Operiert global (Betreiber), respektiert aber pro Datensatz die practice_id.
export async function runMaintenance(dryRun: boolean): Promise<MaintenanceResult> {
  const admin = createClient();
  const items: MaintenanceItem[] = [];
  let repairedTotal = 0;

  // ---------------------------------------------------------------
  // 1. Bestätigte Auth-User ohne Praxis
  // ---------------------------------------------------------------
  let accountsWithoutPractice = 0;
  let missingName = 0;
  try {
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const { data: practices } = await admin.from("practices").select("auth_uid");
    const haveSet = new Set((practices ?? []).map((p) => p.auth_uid));

    const brokenUsers = (usersData?.users ?? []).filter(
      (u) =>
        u.email_confirmed_at &&
        !u.email?.startsWith("systemcheck+") &&
        !haveSet.has(u.id),
    );
    accountsWithoutPractice = brokenUsers.length;
    missingName = brokenUsers.filter((u) => !u.user_metadata?.practice_name).length;

    if (!dryRun && brokenUsers.length > 0) {
      let fixed = 0;
      for (const u of brokenUsers) {
        const practice = await ensureOnboarding(admin, u);
        if (practice) fixed += 1;
      }
      repairedTotal += fixed;
      await logEntry(admin, {
        problem_type: "accountsWithoutPractice",
        affected_table: "practices",
        action: "ensureOnboarding",
        result: `${fixed}/${brokenUsers.length} repariert`,
        dry_run: false,
      });
    }
  } catch (err) {
    console.error("[maintenance] Account-Prüfung fehlgeschlagen:", err);
  }
  items.push({
    type: "accountsWithoutPractice",
    severity: accountsWithoutPractice > 0 ? "warn" : "ok",
    count: accountsWithoutPractice,
    autoFixable: true,
  });
  if (missingName > 0) {
    items.push({ type: "missingPracticeName", severity: "warn", count: missingName, autoFixable: false });
  }

  // ---------------------------------------------------------------
  // Wartelisten-Daten einmalig laden
  // ---------------------------------------------------------------
  const { data: waitlistRaw } = await admin
    .from("waitlist")
    .select("id, practice_id, patient_id, created_at");
  const waitlist: WaitlistRow[] = waitlistRaw ?? [];

  const { data: patientRows } = await admin.from("patients").select("id");
  const patientSet = new Set((patientRows ?? []).map((p) => p.id));

  const { data: filledAppts } = await admin
    .from("appointments")
    .select("practice_id, filled_by_patient_id")
    .eq("status", "filled")
    .not("filled_by_patient_id", "is", null);
  const filledSet = new Set(
    (filledAppts ?? []).map((a) => `${a.practice_id}:${a.filled_by_patient_id}`),
  );

  const toDelete = new Set<string>();

  // 2a. Wartelisten-Einträge ohne gültigen Patienten (verwaiste Verknüpfung)
  const orphanIds = waitlist
    .filter((w) => !w.patient_id || !patientSet.has(w.patient_id))
    .map((w) => w.id);
  orphanIds.forEach((id) => toDelete.add(id));

  // 2b. Duplikate (gleiche practice_id + patient_id) – ältesten behalten
  const seen = new Set<string>();
  const dupIds: string[] = [];
  for (const w of [...waitlist].sort((a, b) =>
    (a.created_at ?? "").localeCompare(b.created_at ?? ""),
  )) {
    if (!w.patient_id || !patientSet.has(w.patient_id)) continue;
    const key = `${w.practice_id}:${w.patient_id}`;
    if (seen.has(key)) dupIds.push(w.id);
    else seen.add(key);
  }
  dupIds.forEach((id) => toDelete.add(id));

  // 3. Patienten, die einen Termin angenommen haben, aber noch auf der Liste stehen
  const claimedIds = waitlist
    .filter(
      (w) =>
        w.patient_id &&
        patientSet.has(w.patient_id) &&
        filledSet.has(`${w.practice_id}:${w.patient_id}`),
    )
    .map((w) => w.id);
  claimedIds.forEach((id) => toDelete.add(id));

  // Reporting
  items.push({ type: "orphanWaitlist", severity: orphanIds.length ? "warn" : "ok", count: orphanIds.length, autoFixable: true });
  items.push({ type: "duplicateWaitlist", severity: dupIds.length ? "warn" : "ok", count: dupIds.length, autoFixable: true });
  items.push({ type: "claimedStillOnWaitlist", severity: claimedIds.length ? "warn" : "ok", count: claimedIds.length, autoFixable: true });

  // Reparatur: betroffene Wartelisten-Einträge entfernen
  if (!dryRun && toDelete.size > 0) {
    const ids = Array.from(toDelete);
    const { error } = await admin.from("waitlist").delete().in("id", ids);
    if (!error) {
      repairedTotal += ids.length;
      await logEntry(admin, {
        problem_type: "waitlistCleanup",
        affected_table: "waitlist",
        action: "delete",
        result: `${ids.length} Einträge entfernt (verwaist/Duplikat/bereits gebucht)`,
        dry_run: false,
      });
    } else {
      await logEntry(admin, {
        problem_type: "waitlistCleanup",
        affected_table: "waitlist",
        action: "delete",
        result: "fehlgeschlagen",
        dry_run: false,
        error_message: error.message,
      });
    }
  }

  // Konfigurationsprüfung Nachrichten-Anbieter (Warnung, nie Fehler, nicht auto-fixbar).
  const messaging = messagingStatus();
  if (!messaging.activeConfigured) {
    items.push({
      type: "messagingNotConfigured",
      severity: "warn",
      count: 1,
      autoFixable: false,
    });
  }

  const hasWarn = items.some((i) => i.severity === "warn" && i.count > 0);
  const hasError = items.some((i) => i.severity === "error" && i.count > 0);
  const status: MaintenanceResult["status"] = hasError
    ? "error"
    : hasWarn && dryRun
      ? "warn"
      : "ok";

  return { status, dryRun, items, repairedTotal };
}

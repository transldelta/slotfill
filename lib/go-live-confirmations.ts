/**
 * lib/go-live-confirmations.ts
 *
 * Manuelle Go-Live-Bestätigungen – Persistenz über audit_logs.
 *
 * DESIGN:
 * - Keine eigene DB-Tabelle nötig (keine Migration).
 * - Bestätigungen werden als audit_log-Einträge gespeichert
 *   (action = "go_live_confirm_<key>").
 * - Nur der Admin darf bestätigen (Prüfung erfolgt in der API-Route).
 * - Keine automatischen Aktionen – rein manuell.
 * - Jede Bestätigung ist audit-geloggt (key, confirmed_by, confirmed_at).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type ManualConfirmationKey =
  | "prod_domain"
  | "languages_checked"
  | "backup_review"
  | "messaging_safe";

export type ConfirmationRecord = {
  key: ManualConfirmationKey;
  confirmedBy: string;
  confirmedAt: string;
};

export type ConfirmationsMap = Partial<Record<ManualConfirmationKey, ConfirmationRecord>>;

// ─── Statische Konfiguration ──────────────────────────────────────────────────

export const MANUAL_CONFIRMATIONS: Array<{
  key: ManualConfirmationKey;
  checklistId: string;
  label: string;
}> = [
  {
    key: "prod_domain",
    checklistId: "CL01",
    label: "Production-Domain geprüft und live",
  },
  {
    key: "languages_checked",
    checklistId: "CL09",
    label: "10 Sprachen stichprobenartig geprüft",
  },
  {
    key: "backup_review",
    checklistId: "CL10",
    label: "Backup-Review erledigt",
  },
  {
    key: "messaging_safe",
    checklistId: "CL13",
    label: "Messaging bleibt sicher bestätigt",
  },
];

export const MANUAL_CONFIRMATION_KEYS: ManualConfirmationKey[] =
  MANUAL_CONFIRMATIONS.map((c) => c.key);

// ─── DB-Hilfsfunktionen ───────────────────────────────────────────────────────

/**
 * Liest alle manuellen Bestätigungen aus dem audit_log.
 * Gibt für jeden Key den neuesten Eintrag zurück.
 * Fehler werden abgefangen – liefert leere Map zurück.
 */
export async function getConfirmations(
  adminClient: SupabaseClient,
): Promise<ConfirmationsMap> {
  try {
    const actions = MANUAL_CONFIRMATION_KEYS.map(
      (k) => `go_live_confirm_${k}`,
    );
    const { data, error } = await adminClient
      .from("audit_logs")
      .select("action, actor_email, created_at")
      .in("action", actions)
      .order("created_at", { ascending: false });

    if (error || !data) return {};

    const map: ConfirmationsMap = {};
    for (const row of data as Array<{
      action: string;
      actor_email: string | null;
      created_at: string;
    }>) {
      const key = row.action.replace(
        "go_live_confirm_",
        "",
      ) as ManualConfirmationKey;
      // Nur den neuesten Eintrag pro Key speichern (bereits absteigend sortiert)
      if (!map[key]) {
        map[key] = {
          key,
          confirmedBy: row.actor_email ?? "admin",
          confirmedAt: row.created_at,
        };
      }
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Schreibt eine manuelle Bestätigung in den audit_log.
 * Wirft bei Fehler – der Aufrufer muss den Fehler behandeln.
 */
export async function setConfirmation(
  adminClient: SupabaseClient,
  key: ManualConfirmationKey,
  email: string,
  userId: string,
): Promise<void> {
  const { error } = await adminClient.from("audit_logs").insert({
    action: `go_live_confirm_${key}`,
    area: "operations",
    status: "success",
    actor_user_id: userId,
    actor_email: email,
    metadata: {
      manualConfirmation: true,
      key,
      note: "Manuelle Go-Live-Bestätigung durch Admin. Keine automatische Aktion.",
    },
  });
  if (error) {
    throw new Error(`[go-live-confirmations] setConfirmation fehlgeschlagen: ${error.message}`);
  }
}

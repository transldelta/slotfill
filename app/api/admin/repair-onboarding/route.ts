import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { ensureOnboarding } from "@/lib/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/repair-onboarding – findet bestätigte Auth-User ohne Praxis
// und legt idempotent Praxis, Trial-Abo, Welcome-Mail + email_logs an.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  let scanned = 0;
  let repaired = 0;
  let failed = 0;
  let missingName = 0;

  try {
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (usersError) {
      return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
    }

    const { data: practices } = await admin.from("practices").select("auth_uid");
    const haveSet = new Set((practices ?? []).map((p) => p.auth_uid));

    for (const user of usersData?.users ?? []) {
      if (!user.email_confirmed_at) continue; // nur bestätigte Konten
      if (user.email?.startsWith("systemcheck+")) continue; // Testdaten ignorieren
      if (haveSet.has(user.id)) continue; // Praxis existiert bereits

      scanned += 1;
      if (!user.user_metadata?.practice_name) {
        missingName += 1;
        console.warn("[repair-onboarding] Kein practice_name in Metadaten:", user.id);
      }

      const practice = await ensureOnboarding(admin, user);
      if (practice) {
        repaired += 1;
      } else {
        failed += 1;
      }
    }
  } catch (err) {
    console.error("[repair-onboarding] Fehler:", err);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({
    code: "REPAIR_DONE",
    scanned,
    repaired,
    failed,
    missingName,
  });
}

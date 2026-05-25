import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";
import { toPatientName } from "@/lib/patients";
import { messagingStatus } from "@/lib/messaging";

export const dynamic = "force-dynamic";

type NotificationRow = {
  id: string;
  patient_id: string | null;
  delivered: boolean | null;
  created_at: string | null;
  status?: string | null;
};

// GET /api/notifications – Protokoll der versendeten Benachrichtigungen.
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  // Mit status laden; falls Spalte fehlt (Migration 012 noch nicht eingespielt),
  // ohne status erneut laden – kein Absturz.
  let rows: NotificationRow[] | null = (
    await admin
      .from("sent_notifications")
      .select("id, patient_id, delivered, created_at, status")
      .eq("practice_id", practiceId)
      .order("created_at", { ascending: false })
      .limit(50)
  ).data;

  if (rows === null) {
    const fallback = await admin
      .from("sent_notifications")
      .select("id, patient_id, delivered, created_at")
      .eq("practice_id", practiceId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (fallback.error) {
      console.error("[GET /api/notifications] Laden fehlgeschlagen:", fallback.error);
      return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
    }
    rows = fallback.data;
  }

  const patientIds = Array.from(
    new Set(
      (rows ?? [])
        .map((r) => r.patient_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const names = new Map<string, string>();
  if (patientIds.length > 0) {
    const { data: patients } = await admin
      .from("patients")
      .select("id, first_name, last_name")
      .in("id", patientIds);
    for (const p of patients ?? []) {
      names.set(p.id, toPatientName(p.first_name, p.last_name));
    }
  }

  const notifications = (rows ?? []).map((r) => ({
    id: r.id,
    patientName: r.patient_id ? (names.get(r.patient_id) ?? null) : null,
    delivered: r.delivered,
    status: "status" in r ? (r.status ?? null) : null,
    createdAt: r.created_at,
  }));

  return NextResponse.json({
    code: "NOTIFICATIONS_LOADED",
    notifications,
    providerConfigured: messagingStatus().activeConfigured,
  });
}

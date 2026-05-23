import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";
import { toPatientName } from "@/lib/patients";

export const dynamic = "force-dynamic";

// GET /api/notifications – Protokoll der versendeten Benachrichtigungen.
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { data: rows, error } = await admin
    .from("sent_notifications")
    .select("id, patient_id, appointment_id, delivered, created_at")
    .eq("practice_id", practiceId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[GET /api/notifications] Laden fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
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
    createdAt: r.created_at,
  }));

  return NextResponse.json({ code: "NOTIFICATIONS_LOADED", notifications });
}

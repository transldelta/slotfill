import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { toPatientName } from "@/lib/patients";

export const dynamic = "force-dynamic";

const STATUSES = ["scheduled", "cancelled", "filled"] as const;

// GET /api/appointments?status=...&from=...&to=...
export async function GET(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = admin
    .from("appointments")
    .select("id, scheduled_time, status, patient_id, filled_by_patient_id")
    .eq("practice_id", practiceId)
    .order("scheduled_time", { ascending: true });

  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    query = query.eq("status", status);
  }
  if (from) query = query.gte("scheduled_time", from);
  if (to) query = query.lte("scheduled_time", to);

  const { data: appointments, error } = await query;
  if (error) {
    console.error("[GET /api/appointments] Laden fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  // Patientennamen in einem zweiten Query laden und zuordnen.
  const patientIds = Array.from(
    new Set(
      (appointments ?? [])
        .flatMap((a) => [a.patient_id, a.filled_by_patient_id])
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

  const result = (appointments ?? []).map((a) => ({
    id: a.id,
    scheduledTime: a.scheduled_time,
    status: a.status,
    patientId: a.patient_id,
    patientName: a.patient_id ? (names.get(a.patient_id) ?? null) : null,
    filledByPatientName: a.filled_by_patient_id
      ? (names.get(a.filled_by_patient_id) ?? null)
      : null,
  }));

  return NextResponse.json({ appointments: result });
}

const createSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_time: z.string().datetime({ offset: true }),
});

// POST /api/appointments – neuen Termin anlegen.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", errors: parsed.error.issues },
      { status: 422 },
    );
  }
  const { patient_id, scheduled_time } = parsed.data;

  // Patient muss zur eigenen Praxis gehören.
  const { data: patient } = await admin
    .from("patients")
    .select("id")
    .eq("id", patient_id)
    .eq("practice_id", practiceId)
    .maybeSingle();
  if (!patient) {
    return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("appointments")
    .insert({
      practice_id: practiceId,
      patient_id,
      scheduled_time,
      status: "scheduled",
    })
    .select("id, scheduled_time, status, patient_id")
    .single();
  if (error || !data) {
    console.error("[POST /api/appointments] Insert fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json(
    { code: "APPOINTMENT_CREATED", appointment: data },
    { status: 201 },
  );
}

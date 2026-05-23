import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { insertPatient, toPatientName } from "@/lib/patients";

export const dynamic = "force-dynamic";

// GET /api/patients – alle Patienten der eigenen Praxis (mit Wartelisten-Status).
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  // Erst mit notes versuchen; falls die Spalte fehlt (Migration 003 nicht
  // eingespielt), ohne notes erneut laden, damit die Liste trotzdem lädt.
  type PatientListRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    notes?: string | null;
  };

  let patients: PatientListRow[] | null = (
    await admin
      .from("patients")
      .select("id, first_name, last_name, phone, notes")
      .eq("practice_id", practiceId)
      .order("first_name", { ascending: true })
  ).data;

  if (patients === null) {
    const fallback = await admin
      .from("patients")
      .select("id, first_name, last_name, phone")
      .eq("practice_id", practiceId)
      .order("first_name", { ascending: true });
    if (fallback.error) {
      console.error("[GET /api/patients] Laden fehlgeschlagen:", fallback.error);
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }
    patients = fallback.data;
  }

  const { data: waitlistRows } = await admin
    .from("waitlist")
    .select("patient_id")
    .eq("practice_id", practiceId);
  const onWaitlist = new Set((waitlistRows ?? []).map((r) => r.patient_id));

  const result = (patients ?? []).map((p) => ({
    id: p.id,
    name: toPatientName(p.first_name, p.last_name),
    phone: p.phone,
    notes: "notes" in p ? p.notes : null,
    onWaitlist: onWaitlist.has(p.id),
  }));

  return NextResponse.json({ patients: result });
}

const createSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/),
  notes: z.string().trim().optional(),
});

// POST /api/patients – neuen Patienten anlegen.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { name, phone, notes } = parsed.data;

  const { patient, error } = await insertPatient(admin, practiceId, {
    name,
    phone,
    notes,
  });
  if (error || !patient) {
    console.error("[POST /api/patients] Insert fehlgeschlagen:", error);
    return NextResponse.json({ error: "DATABASE_INSERT_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ patient }, { status: 201 });
}

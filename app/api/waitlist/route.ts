import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

// GET /api/waitlist – alle Patienten der Praxis, die auf der Warteliste stehen.
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { data, error } = await admin
    .from("waitlist")
    .select("patient_id, created_at, patients ( first_name, last_name, phone )")
    .eq("practice_id", practiceId)
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  const entries = (data ?? [])
    .map((row) => {
      const patient = Array.isArray(row.patients)
        ? row.patients[0]
        : row.patients;
      if (!patient) return null;
      return {
        patientId: row.patient_id as string,
        name: [patient.first_name, patient.last_name]
          .filter(Boolean)
          .join(" ")
          .trim(),
        phone: patient.phone ?? null,
        since: row.created_at as string,
      };
    })
    .filter((entry) => entry !== null);

  return NextResponse.json({ entries });
}

const addSchema = z.object({ patient_id: z.string().uuid() });

// POST /api/waitlist – Patient zur Warteliste hinzufügen.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { patient_id } = parsed.data;

  // Patient muss zur eigenen Praxis gehören.
  const { data: patient } = await admin
    .from("patients")
    .select("id")
    .eq("id", patient_id)
    .eq("practice_id", practiceId)
    .maybeSingle();
  if (!patient) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  // Bereits auf der Warteliste?
  const { data: existing } = await admin
    .from("waitlist")
    .select("id")
    .eq("practice_id", practiceId)
    .eq("patient_id", patient_id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "CONFLICT" }, { status: 409 });
  }

  const { error } = await admin
    .from("waitlist")
    .insert({ practice_id: practiceId, patient_id });
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ onWaitlist: true }, { status: 201 });
}

// DELETE /api/waitlist – komplette Warteliste der Praxis leeren.
export async function DELETE() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { error } = await admin
    .from("waitlist")
    .delete()
    .eq("practice_id", practiceId);
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

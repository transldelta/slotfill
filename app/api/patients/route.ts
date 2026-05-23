import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

// GET /api/patients – alle Patienten der eigenen Praxis (mit Wartelisten-Status).
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { data: patients, error } = await admin
    .from("patients")
    .select("id, first_name, last_name, phone, notes")
    .eq("practice_id", practiceId)
    .order("first_name", { ascending: true });
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  const { data: waitlistRows } = await admin
    .from("waitlist")
    .select("patient_id")
    .eq("practice_id", practiceId);
  const onWaitlist = new Set((waitlistRows ?? []).map((r) => r.patient_id));

  const result = (patients ?? []).map((p) => ({
    id: p.id,
    name: [p.first_name, p.last_name].filter(Boolean).join(" ").trim(),
    phone: p.phone,
    notes: p.notes,
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

  const { data, error } = await admin
    .from("patients")
    .insert({
      practice_id: practiceId,
      first_name: name,
      last_name: "",
      phone,
      notes: notes || null,
    })
    .select("id, first_name, last_name, phone, notes")
    .single();
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json(
    {
      patient: {
        id: data.id,
        name: [data.first_name, data.last_name].filter(Boolean).join(" ").trim(),
        phone: data.phone,
        notes: data.notes,
        onWaitlist: false,
      },
    },
    { status: 201 },
  );
}

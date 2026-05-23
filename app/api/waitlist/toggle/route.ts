import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

const toggleSchema = z.object({ patient_id: z.string().uuid() });

// POST /api/waitlist/toggle – Wartelisten-Status eines Patienten umschalten.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
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

  const { data: existing } = await admin
    .from("waitlist")
    .select("id")
    .eq("practice_id", practiceId)
    .eq("patient_id", patient_id)
    .maybeSingle();

  if (existing) {
    await admin.from("waitlist").delete().eq("id", existing.id);
    return NextResponse.json({ onWaitlist: false });
  }

  const { error } = await admin
    .from("waitlist")
    .insert({ practice_id: practiceId, patient_id });
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ onWaitlist: true });
}

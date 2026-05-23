import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["cancelled", "filled"]),
});

// PATCH /api/appointments/[id] – Status setzen (cancelled | filled).
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }

  const { data, error } = await admin
    .from("appointments")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("practice_id", practiceId)
    .select("id, scheduled_time, status, patient_id, filled_by_patient_id")
    .maybeSingle();

  if (error) {
    console.error("[PATCH /api/appointments/[id]] Update fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ code: "APPOINTMENT_UPDATED", appointment: data });
}

// DELETE /api/appointments/[id] – Termin löschen.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const { data, error } = await admin
    .from("appointments")
    .delete()
    .eq("id", params.id)
    .eq("practice_id", practiceId)
    .select("id");
  if (error) {
    console.error("[DELETE /api/appointments/[id]] Löschen fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

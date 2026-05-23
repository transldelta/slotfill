"use server";

import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export type ActionResult = {
  success?: boolean;
  // Maschinenlesbarer Code; deutsche Texte kommen im Frontend aus de.json.
  error?: string;
};

const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  scheduled_time: z.string().datetime({ offset: true }),
});

// Server-Action für das Formular in new/page.tsx.
// Die practice_id wird IMMER serverseitig aus der Session ermittelt.
export async function createAppointment(
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return { error: "PRACTICE_NOT_FOUND" };
  }
  const { admin, practiceId } = ctx;

  // datetime-local liefert "YYYY-MM-DDTHH:mm" ohne Zeitzone – in ISO wandeln.
  const rawTime = formData.get("scheduled_time");
  const isoTime =
    typeof rawTime === "string" && rawTime ? new Date(rawTime).toISOString() : "";

  const parsed = appointmentSchema.safeParse({
    patient_id: formData.get("patient_id"),
    scheduled_time: isoTime,
  });
  if (!parsed.success) {
    return { error: "VALIDATION_ERROR" };
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
    return { error: "VALIDATION_ERROR" };
  }

  const { error } = await admin.from("appointments").insert({
    practice_id: practiceId,
    patient_id,
    scheduled_time,
    status: "scheduled",
  });
  if (error) {
    console.error("[createAppointment] Insert fehlgeschlagen:", error);
    return { error: "DATABASE_INSERT_FAILED" };
  }

  return { success: true };
}

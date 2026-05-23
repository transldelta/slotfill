"use server";

import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { insertPatient } from "@/lib/patients";

export type ActionResult = {
  success?: boolean;
  // Maschinenlesbarer Fehlercode; die deutschen Texte kommen im Frontend
  // aus messages/de.json.
  error?: string;
};

const patientSchema = z.object({
  name: z.string().trim().min(1),
  // Telefonnummer im internationalen E.164-Format, z. B. +491701234567
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/),
  notes: z.string().trim().optional().or(z.literal("")),
});

// Server-Action für das Formular in new/page.tsx.
// Die practice_id wird IMMER serverseitig aus der Session ermittelt.
export async function createPatient(formData: FormData): Promise<ActionResult> {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    console.error("[createPatient] Keine Praxis für den aktuellen Benutzer gefunden.");
    return { error: "PRACTICE_NOT_FOUND" };
  }

  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    console.error(
      "[createPatient] Validierung fehlgeschlagen:",
      parsed.error.flatten().fieldErrors,
    );
    return { error: "VALIDATION_ERROR" };
  }
  const { name, phone, notes } = parsed.data;

  const { patient, error } = await insertPatient(ctx.admin, ctx.practiceId, {
    name,
    phone,
    notes,
  });
  if (error || !patient) {
    console.error("[createPatient] Supabase-Insert fehlgeschlagen:", error);
    return { error: "DATABASE_INSERT_FAILED" };
  }

  return { success: true };
}

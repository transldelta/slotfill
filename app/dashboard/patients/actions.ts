"use server";

import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export type ActionResult = {
  success?: boolean;
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
  if (!ctx) return { error: "unauthorized" };
  const { admin, practiceId } = ctx;

  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: "invalid" };
  }
  const { name, phone, notes } = parsed.data;

  const { error } = await admin.from("patients").insert({
    practice_id: practiceId,
    first_name: name,
    last_name: "",
    phone,
    notes: notes || null,
  });
  if (error) return { error: "db" };

  return { success: true };
}

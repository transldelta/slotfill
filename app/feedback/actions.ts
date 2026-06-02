"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import {
  buildFeedbackRecord,
  validateFeedbackSubmission,
  requiresImprovementTicket,
} from "@/lib/feedback";
import { analyzeFeedbackForImprovement, isRecurringIssue } from "@/lib/improvement-analysis";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  feedback_text: z.string().trim().max(2000).optional(),
  customer_name: z.string().trim().max(100).optional(),
  customer_email: z.string().trim().email().optional().or(z.literal("")),
  consent_to_publish: z.coerce.boolean().optional().default(false),
  consent_internal: z.coerce.boolean(),
  tenant_id: z.string().uuid().optional(),
});

export type SubmitFeedbackResult =
  | { code: "FEEDBACK_SAVED"; feedbackId: string; rating: number }
  | { code: "FEEDBACK_ERROR"; message: string }
  | { code: "CONSENT_MISSING" }
  | { code: "VALIDATION_ERROR"; message: string };

/**
 * Verarbeitet ein Feedback-Formular.
 *
 * Sicherheitsregeln:
 * - consent_internal muss true sein
 * - visibility ist immer 'private' beim Speichern
 * - Bei rating <= 3: Improvement-Ticket automatisch erstellen
 * - Keine automatische Google-Bewertung
 * - Keine automatischen Nachrichten ohne Provider
 */
export async function submitFeedback(
  formData: FormData,
): Promise<SubmitFeedbackResult> {
  const parsed = schema.safeParse({
    rating: formData.get("rating"),
    feedback_text: formData.get("feedback_text") || undefined,
    customer_name: formData.get("customer_name") || undefined,
    customer_email: formData.get("customer_email") || undefined,
    consent_to_publish: formData.get("consent_to_publish") === "true",
    consent_internal: formData.get("consent_internal") === "true",
    tenant_id: formData.get("tenant_id") || undefined,
  });

  if (!parsed.success) {
    return { code: "VALIDATION_ERROR", message: "Ungültige Eingabe." };
  }

  const { rating, feedback_text, customer_name, customer_email,
    consent_to_publish, consent_internal, tenant_id } = parsed.data;

  // Interne Einwilligung ist Pflicht
  if (!consent_internal) {
    return { code: "CONSENT_MISSING" };
  }

  const validationError = validateFeedbackSubmission({
    rating,
    feedback_text,
    customer_name,
    customer_email: customer_email || undefined,
    consent_to_publish,
  });
  if (validationError) {
    return { code: "VALIDATION_ERROR", message: validationError };
  }

  const record = buildFeedbackRecord({
    rating,
    feedback_text,
    customer_name,
    customer_email: customer_email || undefined,
    consent_to_publish,
    tenant_id,
  });

  const supabase = createClient();

  // Feedback speichern
  const { data: saved, error } = await supabase
    .from("feedback_reviews")
    .insert(record)
    .select("id")
    .single();

  if (error || !saved) {
    console.error("[feedback] insert error:", error?.message);
    return { code: "FEEDBACK_ERROR", message: "Feedback konnte nicht gespeichert werden." };
  }

  // Bei rating <= 3: Improvement-Ticket automatisch erstellen
  if (requiresImprovementTicket(rating)) {
    const analysis = analyzeFeedbackForImprovement({
      rating,
      feedback_text: feedback_text ?? null,
      feedback_id: saved.id,
      tenant_id,
    });

    // Recurring-Issue-Check: Ähnliche Tickets in den letzten 7 Tagen
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: existingCount } = await supabase
      .from("improvement_tickets")
      .select("id", { count: "exact", head: true })
      .eq("recurring_issue_key", analysis.recurring_issue_key)
      .gte("created_at", sevenDaysAgo);

    const isRecurring = isRecurringIssue({
      recurring_issue_key: analysis.recurring_issue_key,
      existingCount: existingCount ?? 0,
    });

    await supabase.from("improvement_tickets").insert({
      tenant_id: tenant_id ?? null,
      feedback_id: saved.id,
      category: analysis.category,
      severity: analysis.severity,
      summary: analysis.summary,
      suggested_action: analysis.suggested_action,
      status: "new",
      assigned_role: analysis.assigned_role,
      recurring_issue_key: analysis.recurring_issue_key,
      is_recurring: isRecurring,
    });
  }

  return { code: "FEEDBACK_SAVED", feedbackId: saved.id, rating };
}

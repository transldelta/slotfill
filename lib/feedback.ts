/**
 * lib/feedback.ts – Kern-Logik für das Bewertungsmodul
 *
 * Sicherheitsregeln (nicht verhandelbar):
 * - rating <= 3 bleibt IMMER private, niemals öffentliches Testimonial
 * - visibility = 'public' erfordert: rating >= 4, consent_to_publish = true,
 *   reviewed_by_admin = true
 * - Keine automatische Google-Bewertung
 * - Google-Link nur als optionaler Button (ENV: NEXT_PUBLIC_GOOGLE_REVIEW_URL)
 * - Keine Manipulation / kein Löschen von Bewertungen
 * - Keine automatischen Nachrichten ohne konfigurierten Provider
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

export type FeedbackVisibility = "private" | "public";
export type FeedbackStatus = "new" | "reviewed" | "resolved" | "archived";

export interface FeedbackReview {
  id: string;
  tenant_id: string | null;
  rating: number; // 1–5
  feedback_text: string | null;
  customer_name: string | null;
  customer_email: string | null;
  visibility: FeedbackVisibility;
  status: FeedbackStatus;
  consent_to_publish: boolean;
  reviewed_by_admin: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackSubmission {
  rating: number;
  feedback_text?: string;
  customer_name?: string;
  customer_email?: string;
  consent_to_publish: boolean;
  tenant_id?: string;
}

// ─── Sicherheits-Prüfungen ─────────────────────────────────────────────────

/**
 * Prüft ob Feedback öffentlich angezeigt werden darf.
 * Alle drei Bedingungen MÜSSEN erfüllt sein.
 */
export function canBePublic(feedback: Pick<FeedbackReview,
  "rating" | "visibility" | "consent_to_publish" | "reviewed_by_admin">
): boolean {
  return (
    feedback.rating >= 4 &&
    feedback.visibility === "public" &&
    feedback.consent_to_publish === true &&
    feedback.reviewed_by_admin === true
  );
}

/**
 * Validiert eine Feedback-Einreichung vor dem Speichern.
 * Gibt null zurück wenn valid, sonst Fehlermeldung.
 */
export function validateFeedbackSubmission(data: Partial<FeedbackSubmission>): string | null {
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    return "Bewertung muss zwischen 1 und 5 Sternen liegen.";
  }
  if (data.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) {
    return "Ungültige E-Mail-Adresse.";
  }
  if (data.feedback_text && data.feedback_text.length > 2000) {
    return "Feedback-Text darf maximal 2000 Zeichen lang sein.";
  }
  if (data.customer_name && data.customer_name.length > 100) {
    return "Name darf maximal 100 Zeichen lang sein.";
  }
  return null;
}

/**
 * Erstellt die Datenbankzeile für ein neues Feedback.
 * Erzwingt: visibility='private', reviewed_by_admin=false.
 * Bei rating <= 3: consent_to_publish immer false erzwungen.
 */
export function buildFeedbackRecord(data: FeedbackSubmission): Omit<FeedbackReview,
  "id" | "created_at" | "updated_at"> {
  const isBadRating = data.rating <= 3;

  return {
    tenant_id: data.tenant_id ?? null,
    rating: data.rating,
    feedback_text: data.feedback_text?.trim() || null,
    customer_name: data.customer_name?.trim() || null,
    customer_email: data.customer_email?.trim() || null,
    // IMMER private beim Einreichen
    visibility: "private",
    status: "new",
    // Bei schlechter Bewertung: consent erzwungen false
    consent_to_publish: isBadRating ? false : Boolean(data.consent_to_publish),
    reviewed_by_admin: false,
    reviewed_by: null,
    reviewed_at: null,
  };
}

/**
 * Gibt zurück ob für dieses Feedback ein Improvement-Ticket erstellt werden soll.
 * Ja, wenn rating <= 3.
 */
export function requiresImprovementTicket(rating: number): boolean {
  return rating <= 3;
}

/**
 * Gibt zurück ob ein Admin-Review empfohlen wird.
 * Immer true für schlechte Bewertungen; optional für gute.
 */
export function requiresAdminReview(rating: number): boolean {
  return rating <= 3;
}

/**
 * Gibt die Google-Review-URL zurück (nur aus ENV, nie automatisch).
 * Patient entscheidet selbst ob er klickt.
 * Keine automatische Google-Bewertung!
 */
export function getGoogleReviewUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? null;
  if (!url) return null;
  // Sicherheits-Check: Muss eine Google-URL sein
  if (!url.startsWith("https://") && !url.startsWith("http://")) return null;
  return url;
}

// ─── Anzeige-Hilfsfunktionen ──────────────────────────────────────────────

/** Formatiert Sterne als Text für Barrierefreiheit */
export function formatRating(rating: number): string {
  return `${rating} von 5 Sternen`;
}

/** Bestimmung der Dringlichkeit für Admin-Dashboard */
export type FeedbackPriority = "low" | "medium" | "high" | "urgent";

export function getFeedbackPriority(rating: number): FeedbackPriority {
  if (rating === 1) return "urgent";
  if (rating === 2) return "high";
  if (rating === 3) return "medium";
  return "low";
}

/** Farb-Klasse für Sterne-Anzeige */
export function getRatingColor(rating: number): string {
  if (rating <= 2) return "text-red-500";
  if (rating === 3) return "text-amber-500";
  return "text-green-500";
}

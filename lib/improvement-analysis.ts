/**
 * lib/improvement-analysis.ts – Automatische Analyse von schlechtem Feedback
 *
 * DARF automatisch:
 * - Tickets erstellen (als Datensatz)
 * - Kategorie und Severity einschätzen
 * - Zusammenfassung erstellen
 * - Verbesserungsvorschläge machen
 * - Muster (Recurring Issues) erkennen
 *
 * DARF NICHT automatisch:
 * - öffentliche Bewertungen löschen oder manipulieren
 * - Google-Bewertungen beeinflussen
 * - Code ändern
 * - Preise ändern
 * - medizinische Entscheidungen treffen
 * - echte Nachrichten ohne Provider senden
 * - CEO/Admin-Aktionen auslösen ohne menschliche Freigabe
 */

// ─── Typen ─────────────────────────────────────────────────────────────────

export type ImprovementCategory =
  | "usability"
  | "pricing"
  | "communication"
  | "booking"
  | "notification"
  | "trust"
  | "legal_privacy"
  | "technical_bug"
  | "other";

export type ImprovementSeverity = "low" | "medium" | "high" | "urgent";

export type ImprovementStatus =
  | "new"
  | "reviewed"
  | "action_planned"
  | "in_progress"
  | "resolved"
  | "rejected";

export type ImprovementAssignedRole = "admin" | "ceo" | "support" | "product";

export interface ImprovementTicket {
  id: string;
  tenant_id: string | null;
  feedback_id: string | null;
  category: ImprovementCategory;
  severity: ImprovementSeverity;
  summary: string;
  suggested_action: string;
  status: ImprovementStatus;
  rejection_reason: string | null;
  assigned_role: ImprovementAssignedRole;
  recurring_issue_key: string | null;
  is_recurring: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackAnalysisInput {
  rating: number;
  feedback_text: string | null;
  feedback_id?: string;
  tenant_id?: string;
}

export interface FeedbackAnalysisResult {
  category: ImprovementCategory;
  severity: ImprovementSeverity;
  summary: string;
  suggested_action: string;
  assigned_role: ImprovementAssignedRole;
  recurring_issue_key: string;
}

// ─── Keyword-Regeln ───────────────────────────────────────────────────────
// Jede Regel: keywords (deutsch + englisch) → Kategorie + Basis-Severity

interface CategoryRule {
  keywords: string[];
  category: ImprovementCategory;
  baseSeverity: ImprovementSeverity;
  suggestedAction: string;
  assignedRole: ImprovementAssignedRole;
}

const CATEGORY_RULES: CategoryRule[] = [
  // Legal / Datenschutz – immer urgent
  {
    keywords: [
      "datenschutz", "dsgvo", "daten", "privacy", "gdpr",
      "sicher", "security", "leak", "breach", "unsicher",
      "persönliche daten", "personal data",
    ],
    category: "legal_privacy",
    baseSeverity: "urgent",
    suggestedAction:
      "Datenschutzrelevante Meldung – sofortige Prüfung durch Datenschutzbeauftragten oder Rechtsanwalt empfohlen. KEINE automatischen Änderungen.",
    assignedRole: "ceo",
  },
  // Technischer Fehler
  {
    keywords: [
      "fehler", "bug", "error", "funktioniert nicht", "lädt nicht",
      "absturz", "crash", "broken", "does not work", "not working",
      "kaputt", "seite lädt", "timeout", "500", "404",
    ],
    category: "technical_bug",
    baseSeverity: "high",
    suggestedAction:
      "Technisches Problem identifiziert. Entwicklungs-Review empfohlen. Prüfen ob reproduzierbar und ob mehrere Nutzer betroffen sind.",
    assignedRole: "product",
  },
  // Terminbuchung
  {
    keywords: [
      "termin", "buchung", "buchen", "appointment", "booking",
      "kalender", "calendar", "slot", "freier termin",
    ],
    category: "booking",
    baseSeverity: "high",
    suggestedAction:
      "Terminbuchungs-Prozess überprüfen. Sicherstellen dass Buchungsflow für Patienten verständlich und zuverlässig funktioniert.",
    assignedRole: "product",
  },
  // Preis / Kosten
  {
    keywords: [
      "preis", "teuer", "kosten", "pricing", "expensive", "cost",
      "zu teuer", "günstig", "billig", "tarif", "plan", "abonnement",
    ],
    category: "pricing",
    baseSeverity: "medium",
    suggestedAction:
      "Preisgestaltung und Wertversprechen überprüfen. Vergleich mit Markt empfohlen. KEINE automatische Preisänderung.",
    assignedRole: "ceo",
  },
  // Kommunikation / Antwortzeit
  {
    keywords: [
      "keine antwort", "nicht geantwortet", "support", "hilfe",
      "no response", "no reply", "antwort", "kontakt", "reaktion",
      "wartezeit", "lange gewartet",
    ],
    category: "communication",
    baseSeverity: "high",
    suggestedAction:
      "Kommunikationsprozesse prüfen. Reaktionszeit auf Anfragen messen. Support-Workflow überarbeiten.",
    assignedRole: "support",
  },
  // Benachrichtigungen
  {
    keywords: [
      "benachrichtigung", "notification", "erinnerung", "reminder",
      "sms", "email", "nachricht", "push", "keine erinnerung",
    ],
    category: "notification",
    baseSeverity: "medium",
    suggestedAction:
      "Benachrichtigungs-Einstellungen und -Zustellung prüfen. Sicherstellen dass Nachrichten ankommen und nicht als Spam markiert werden.",
    assignedRole: "product",
  },
  // Vertrauen / Sicherheit (nicht Datenschutz)
  {
    keywords: [
      "vertrauen", "trust", "glaubwürdig", "dubios", "zweifelhaft",
      "unseriös", "betrug", "scam",
    ],
    category: "trust",
    baseSeverity: "high",
    suggestedAction:
      "Vertrauenssignale überprüfen. Transparenz verbessern. Impressum und Datenschutz sichtbar machen.",
    assignedRole: "admin",
  },
  // Bedienbarkeit / UX
  {
    keywords: [
      "bedienung", "usability", "ux", "ui", "interface",
      "kompliziert", "schwierig", "unübersichtlich", "verwirrend",
      "confusing", "difficult", "complicated",
    ],
    category: "usability",
    baseSeverity: "medium",
    suggestedAction:
      "UX-Review durchführen. Problematische Flows identifizieren und nutzerfreundlicher gestalten.",
    assignedRole: "product",
  },
];

// ─── Hauptfunktion ────────────────────────────────────────────────────────

/**
 * Analysiert Feedback-Text automatisch und gibt strukturierte Analyse zurück.
 *
 * Bestimmt: Kategorie, Severity, Zusammenfassung, Verbesserungsvorschlag.
 * Erzeugt recurring_issue_key für Muster-Erkennung.
 *
 * WICHTIG: Gibt nur Empfehlungen zurück. Keine automatischen Aktionen.
 * Admin/CEO muss jede Maßnahme manuell freigeben.
 */
export function analyzeFeedbackForImprovement(
  input: FeedbackAnalysisInput,
): FeedbackAnalysisResult {
  const text = (input.feedback_text ?? "").toLowerCase();
  const rating = input.rating;

  // Keyword-Matching
  let matchedRule: CategoryRule | null = null;
  let highestPriority = -1;

  for (const rule of CATEGORY_RULES) {
    const matchCount = rule.keywords.filter((kw) =>
      text.includes(kw.toLowerCase()),
    ).length;
    if (matchCount > 0 && matchCount > highestPriority) {
      highestPriority = matchCount;
      matchedRule = rule;
    }
  }

  // Fallback wenn kein Keyword gefunden
  const category: ImprovementCategory = matchedRule?.category ?? "other";
  let severity: ImprovementSeverity = matchedRule?.baseSeverity ?? "medium";

  // Severity-Anpassung basierend auf Rating
  if (rating === 1) {
    // Rating 1 → immer mindestens "high", legal_privacy bleibt urgent
    severity = severity === "urgent" ? "urgent" : severity === "high" ? "urgent" : "high";
  } else if (rating === 2) {
    // Rating 2 → mindestens "high"
    if (severity === "low" || severity === "medium") severity = "high";
  }
  // Rating 3 → baseSeverity bleibt (schon mindestens medium)

  const suggestedAction =
    matchedRule?.suggestedAction ??
    "Feedback-Text manuell prüfen und passende Maßnahmen einleiten.";

  const assignedRole = severity === "urgent" || severity === "high"
    ? (matchedRule?.assignedRole ?? "admin") === "product"
      ? "admin"
      : (matchedRule?.assignedRole ?? "admin")
    : (matchedRule?.assignedRole ?? "admin");

  // Zusammenfassung
  const summary = buildSummary(rating, category, text);

  // Recurring Issue Key (normalisierter Key für Clustering)
  const recurring_issue_key = buildRecurringKey(category, severity);

  return {
    category,
    severity,
    summary,
    suggested_action: suggestedAction,
    assigned_role: assignedRole,
    recurring_issue_key,
  };
}

function buildSummary(
  rating: number,
  category: ImprovementCategory,
  text: string,
): string {
  const categoryLabels: Record<ImprovementCategory, string> = {
    usability: "Bedienbarkeit",
    pricing: "Preisgestaltung",
    communication: "Kommunikation",
    booking: "Terminbuchung",
    notification: "Benachrichtigungen",
    trust: "Vertrauen",
    legal_privacy: "Datenschutz/Rechtliches",
    technical_bug: "Technisches Problem",
    other: "Allgemeines Feedback",
  };

  const ratingLabel = rating === 1 ? "Sehr schlechte" : rating === 2 ? "Schlechte" : "Mittelmäßige";
  const catLabel = categoryLabels[category];

  if (text.length > 0) {
    const snippet = text.slice(0, 80).replace(/\s+/g, " ").trim();
    return `${ratingLabel} Bewertung (${rating}★) – ${catLabel}. Originaltext: "${snippet}${text.length > 80 ? "…" : ""}"`;
  }

  return `${ratingLabel} Bewertung (${rating}★) ohne Freitext – Kategorie: ${catLabel}.`;
}

function buildRecurringKey(
  category: ImprovementCategory,
  severity: ImprovementSeverity,
): string {
  // Normalisierter Schlüssel: category + severity-Stufe
  // Wird verwendet um ähnliche Tickets innerhalb von 7 Tagen zu clustern
  return `${category}:${severity}`;
}

// ─── Recurring-Issue-Erkennung ────────────────────────────────────────────

export interface RecurringCheckInput {
  recurring_issue_key: string;
  /** Bereits existierende Tickets mit dem gleichen key aus den letzten 7 Tagen */
  existingCount: number;
  /** Schwellenwert ab dem als "recurring" gilt. Default: 2 */
  threshold?: number;
}

/**
 * Prüft ob ein neues Ticket als "Recurring Issue" markiert werden soll.
 * existingCount = Anzahl ähnlicher Tickets in den letzten 7 Tagen.
 */
export function isRecurringIssue(input: RecurringCheckInput): boolean {
  const threshold = input.threshold ?? 2;
  return input.existingCount >= threshold;
}

/**
 * Gibt den Admin-Hinweistext für ein Recurring Issue zurück.
 */
export function getRecurringIssueHint(count: number): string {
  return `⚠️ Mehrere Nutzer melden dieses Problem (${count + 1}× in den letzten 7 Tagen). CEO-Prüfung empfohlen.`;
}

// ─── Severity-Hilfsfunktionen ─────────────────────────────────────────────

export function isCriticalSeverity(severity: ImprovementSeverity): boolean {
  return severity === "high" || severity === "urgent";
}

export function getSeverityLabel(severity: ImprovementSeverity): string {
  const labels: Record<ImprovementSeverity, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    urgent: "Dringend",
  };
  return labels[severity];
}

export function getSeverityColor(severity: ImprovementSeverity): string {
  const colors: Record<ImprovementSeverity, string> = {
    low: "text-slate-500",
    medium: "text-amber-600",
    high: "text-orange-600",
    urgent: "text-red-600",
  };
  return colors[severity];
}

export function getCategoryLabel(category: ImprovementCategory): string {
  const labels: Record<ImprovementCategory, string> = {
    usability: "Bedienbarkeit",
    pricing: "Preisgestaltung",
    communication: "Kommunikation",
    booking: "Terminbuchung",
    notification: "Benachrichtigungen",
    trust: "Vertrauen",
    legal_privacy: "Datenschutz/Rechtliches",
    technical_bug: "Technisches Problem",
    other: "Sonstiges",
  };
  return labels[category];
}

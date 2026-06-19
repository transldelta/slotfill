/**
 * Client-SICHERE Spam-/Abuse-Helfer für öffentliche Formulare.
 * Enthält KEINE Server-Only-Importe (kein next/headers) – darf daher auch von
 * Client-Komponenten (FormAntiSpamFields) importiert werden.
 *
 * Die IP-basierte Rate-Limit-Schicht (server-only) liegt in lib/form-abuse-server.ts.
 */

export const HONEYPOT_FIELD = "company_url"; // unsichtbares Feld
export const TIMESTAMP_FIELD = "form_ts"; // verstecktes Render-Timestamp

export const MIN_SUBMIT_MS = 3000; // schneller als 3s ⇒ Bot
export const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 6; // älter als 6h ⇒ abgestanden

export const FIELD_LIMITS = {
  name: 120,
  org: 160,
  email: 254,
  phone: 40,
  message: 2500,
  note: 1000,
} as const;

export type AbuseResult = { ok: true } | { ok: false; reason: string };

/** Honeypot + Time-Trap (rein, ohne Request/IP). */
export function checkHoneypotAndTime(formData: FormData): AbuseResult {
  const hp = (formData.get(HONEYPOT_FIELD) ?? "").toString().trim();
  if (hp.length > 0) return { ok: false, reason: "honeypot" };

  const tsRaw = (formData.get(TIMESTAMP_FIELD) ?? "").toString();
  const ts = Number(tsRaw);
  if (!tsRaw || !Number.isFinite(ts)) return { ok: false, reason: "missing-ts" };
  const age = Date.now() - ts;
  if (age < MIN_SUBMIT_MS) return { ok: false, reason: "too-fast" };
  if (age > MAX_FORM_AGE_MS) return { ok: false, reason: "too-old" };

  return { ok: true };
}

/** True bei zu vielen Links, HTML- oder Script-Mustern im Freitext. */
export function isSpammyText(value: string | null | undefined): boolean {
  if (!value) return false;
  const linkCount = (
    value.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info|biz|click|link)\b/gi) ?? []
  ).length;
  if (linkCount > 2) return true;
  if (/<\s*script|<\s*\/?\s*[a-z][^>]*>|javascript:|on[a-z]+\s*=/i.test(value)) return true;
  return false;
}

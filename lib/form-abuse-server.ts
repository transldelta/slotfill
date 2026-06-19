/**
 * Server-Only Spam-/Abuse-Schutz (best-effort In-memory Rate-Limit pro IP).
 * Importiert next/headers → NICHT aus Client-Komponenten importieren.
 *
 * Serverless: kein verlässlicher globaler Zustand → der Speicher wird je
 * Cold-Start zurückgesetzt. Bewusst nur Zusatzschicht (bremst naive Bursts auf
 * einer warmen Instanz), KEIN echtes 24/7-WAF.
 */
import { headers } from "next/headers";
import { checkHoneypotAndTime, type AbuseResult } from "./form-abuse";

const RL_WINDOW_MS = 60_000;
const RL_MAX = 5;
const recentHits = new Map<string, number[]>();

function clientIp(): string {
  try {
    const h = headers();
    const xff = h.get("x-forwarded-for") ?? "";
    return xff.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

/** Honeypot + Time-Trap + best-effort Rate-Limit. Neutrales ok/!ok. */
export function checkFormAbuse(formData: FormData, bucket: string): AbuseResult {
  const base = checkHoneypotAndTime(formData);
  if (!base.ok) return base;

  const key = `${bucket}:${clientIp()}`;
  const now = Date.now();
  const arr = (recentHits.get(key) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  recentHits.set(key, arr);
  if (arr.length > RL_MAX) return { ok: false, reason: "rate-limit" };

  return { ok: true };
}

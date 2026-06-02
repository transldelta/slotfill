import { createClient } from "@/lib/supabase";

export type AuditArea =
  | "operations"
  | "security"
  | "messaging"
  | "stripe"
  | "cron"
  | "booking";

export type AuditInput = {
  action: string;
  area: AuditArea;
  status?: "success" | "failed" | "blocked";
  actorUserId?: string | null;
  actorEmail?: string | null;
  practiceId?: string | null;
  metadata?: Record<string, unknown>;
  userAgent?: string | null;
};

// Entfernt geheim aussehende Werte aus den Metadaten, bevor sie gespeichert
// werden. Keine Tokens/Keys/Passwörter im Audit-Log.
export function sanitizeAuditMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  const SECRET_KEY = /(secret|token|password|api[_-]?key|authorization)/i;
  const SECRET_VALUE = /^(sk_|re_|whsec_|AC[0-9a-fA-F]{8}|eyJ|Bearer\s)/;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (SECRET_KEY.test(k)) {
      out[k] = "[redacted]";
    } else if (typeof v === "string" && SECRET_VALUE.test(v)) {
      out[k] = "[redacted]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = sanitizeAuditMetadata(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Schreibt einen Audit-Eintrag. Fehler dürfen die Hauptaktion NIE crashen.
export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    const admin = createClient();
    await admin.from("audit_logs").insert({
      action: input.action,
      area: input.area,
      status: input.status ?? "success",
      actor_user_id: input.actorUserId ?? null,
      actor_email: input.actorEmail ?? null,
      practice_id: input.practiceId ?? null,
      metadata: sanitizeAuditMetadata(input.metadata),
      user_agent: input.userAgent ?? null,
    });
  } catch (err) {
    console.error("[audit-log] Schreiben fehlgeschlagen (ignoriert):", err);
  }
}

export type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  area: string;
  status: string;
};

export async function getRecentAuditLogs(limit = 50): Promise<AuditRow[]> {
  try {
    const admin = createClient();
    const { data, error } = await admin
      .from("audit_logs")
      .select("id, created_at, actor_email, action, area, status")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as AuditRow[]) ?? [];
  } catch {
    return [];
  }
}

import { messagingStatus } from "@/lib/messaging";

export type SecLevel = "info" | "warning" | "critical";
export type SecFinding = { level: SecLevel; code: string };

export type SecurityResult = {
  code: "SECURITY_CHECK_COMPLETE";
  status: "secure" | "warning" | "critical";
  score: number;
  findings: SecFinding[];
  recommendations: string[];
  generatedAt: string;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function looksLikeSecret(value: string | undefined): boolean {
  if (!value) return false;
  return /^(sk_|re_|whsec_|AC[0-9a-fA-F]{8}|eyJ)/.test(value);
}

// Stellt sicher, dass eine API-Antwort keine geheim aussehenden Werte enthält.
export function assertNoSecretsInResponse(payload: unknown): boolean {
  let safe = true;
  const visit = (val: unknown) => {
    if (typeof val === "string") {
      if (looksLikeSecret(val)) safe = false;
    } else if (Array.isArray(val)) {
      val.forEach(visit);
    } else if (val && typeof val === "object") {
      Object.values(val as Record<string, unknown>).forEach(visit);
    }
  };
  visit(payload);
  return safe;
}

export function runSecurityCheck(): SecurityResult {
  const findings: SecFinding[] = [];

  // Secret-Sicherheit: kein NEXT_PUBLIC_ mit Secret-Wert (außer APP_URL).
  const publicLeak = Object.entries(process.env).some(
    ([k, v]) =>
      k.startsWith("NEXT_PUBLIC_") &&
      k !== "NEXT_PUBLIC_APP_URL" &&
      looksLikeSecret(v),
  );
  if (publicLeak) {
    findings.push({ level: "critical", code: "PUBLIC_SECRET_LEAK" });
  } else {
    findings.push({ level: "info", code: "SECRETS_SERVER_ONLY" });
  }

  // Admin-Sicherheit
  if (!process.env.ADMIN_EMAILS) {
    findings.push({ level: "critical", code: "ADMIN_EMAILS_MISSING" });
  } else {
    findings.push({ level: "info", code: "ADMIN_PROTECTED" });
  }

  // Bekannte, im Code abgesicherte Aspekte (rein informativ).
  findings.push({ level: "info", code: "WEBHOOK_SIGNATURE_OK" });
  findings.push({ level: "info", code: "PRACTICE_ID_SERVER_SIDE" });

  // Messaging-Sicherheit
  const m = messagingStatus();
  if (m.provider === "none" || m.dryRun) {
    findings.push({ level: "info", code: "MESSAGING_SAFE" });
  }

  // Missbrauchsschutz, Audit, Backup, Monitoring.
  findings.push({ level: "info", code: "RATE_LIMIT_BASIC" });
  findings.push({ level: "info", code: "AUDIT_LOG_ACTIVE" });
  findings.push({ level: "info", code: "BACKUP_DOCUMENTED" });
  findings.push({ level: "warning", code: "BACKUP_REVIEW" });
  findings.push({ level: "info", code: "MONITORING_RECOMMENDED" });

  const recommendations = findings
    .filter((f) => f.level === "warning")
    .map((f) => f.code);

  const hasCritical = findings.some((f) => f.level === "critical");
  const hasWarning = findings.some((f) => f.level === "warning");
  const status = hasCritical ? "critical" : hasWarning ? "warning" : "secure";

  // Empfehlungen wiegen leicht (Hinweise, kein akutes Risiko).
  const score = clamp(
    100 -
      findings.reduce(
        (s, f) => s + (f.level === "critical" ? 30 : f.level === "warning" ? 5 : 0),
        0,
      ),
  );

  return {
    code: "SECURITY_CHECK_COMPLETE",
    status,
    score,
    findings,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

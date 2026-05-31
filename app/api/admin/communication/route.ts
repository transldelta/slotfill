/**
 * GET /api/admin/communication
 *
 * Gibt den aktuellen Status der Markenkommunikation zurück:
 * - Brand-Absender (SlotFill Team)
 * - E-Mail-Konfiguration
 * - Messaging-Konfiguration
 * - Sicherheits-Flags
 *
 * READ-ONLY. Kein persönlicher Name in der Antwort.
 * Keine Secrets in der Antwort (assertNoSecretsInResponse).
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import {
  BRAND_NAME,
  BRAND_TEAM_NAME,
  SUPPORT_EMAIL,
  CONTACT_EMAIL,
  PUBLIC_APP_URL,
  PERSONAL_SIGNATURE_ALLOWED,
  ALLOWED_COMMUNICATION_MODES,
} from "@/lib/brand";
import { messagingStatus } from "@/lib/messaging";
import { assertNoSecretsInResponse } from "@/lib/security-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const messaging = messagingStatus();
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? `${BRAND_NAME} <onboarding@resend.dev>`;
  const isTestSender = fromEmail.includes("onboarding@resend.dev");

  const payload = {
    code: "COMMUNICATION_STATUS_READY",
    brand: {
      name: BRAND_NAME,
      teamName: BRAND_TEAM_NAME,
      supportEmail: SUPPORT_EMAIL,
      contactEmail: CONTACT_EMAIL,
      publicUrl: PUBLIC_APP_URL,
      personalSignatureAllowed: PERSONAL_SIGNATURE_ALLOWED,
      allowedModes: ALLOWED_COMMUNICATION_MODES,
    },
    email: {
      configured: hasResendKey,
      fromEmail,
      isTestSender,
      status: hasResendKey
        ? isTestSender
          ? "test_sender"
          : "configured"
        : "not_configured",
    },
    messaging: {
      provider: messaging.provider,
      dryRun: messaging.dryRun,
      status: messaging.provider === "none"
        ? "not_configured"
        : messaging.dryRun
          ? "dry_run"
          : "active",
      note:
        messaging.provider === "none"
          ? "Kein Anbieter konfiguriert – Patientennachrichten werden nur vorbereitet (Dry-Run)."
          : messaging.dryRun
            ? "Dry-Run aktiv – Nachrichten werden simuliert, nicht gesendet."
            : "Anbieter aktiv – Nachrichten werden real gesendet.",
    },
    rules: {
      noPersonalName:
        "Persönliche Namen erscheinen nicht in automatischer Kommunikation.",
      noColdOutreach: "Keine automatische Kaltakquise.",
      noRealMessagingWithoutConfig:
        "Keine echten SMS/WhatsApp ohne bewusste Provider-Konfiguration.",
      allowedCommunication:
        "Erlaubt: Kontaktformular-Eingangsbestätigung, Trial-Anmeldung, Onboarding, Transaktional.",
      impressumExemption:
        "Impressum/Legal darf Anbieterinformationen enthalten (gesetzliche Pflicht).",
    },
  };

  if (!assertNoSecretsInResponse(payload)) {
    return NextResponse.json({ code: "COMMUNICATION_ERROR" }, { status: 500 });
  }

  return NextResponse.json(payload);
}

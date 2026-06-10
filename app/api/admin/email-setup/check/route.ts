import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DomainRecord = {
  record?: string;
  name?: string;
  type?: string;
  value?: string;
  ttl?: string;
  status?: string;
  priority?: number;
};

// Extrahiert die Domain aus "Name <user@domain>" oder "user@domain".
function extractDomain(from: string): string {
  const match = from.match(/<([^>]+)>/);
  const address = (match ? match[1] : from).trim();
  const at = address.lastIndexOf("@");
  return at >= 0 ? address.slice(at + 1).toLowerCase() : "";
}

// POST /api/admin/email-setup/check – prüft Resend-Konfiguration und Domain.
// API-Keys werden niemals an den Client zurückgegeben.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "ClinicSlotHub <onboarding@resend.dev>";
  const hasApiKey = Boolean(apiKey);
  const hasFromEmail = Boolean(process.env.RESEND_FROM_EMAIL);
  const domain = extractDomain(fromEmail);
  const isTestDomain = domain === "resend.dev";

  let domainStatus: "verified" | "not_verified" | "not_found" | "unknown" =
    "unknown";
  let records: DomainRecord[] = [];

  if (hasApiKey && !isTestDomain && domain) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      const list = (await resend.domains.list()) as {
        data?: { data?: { id: string; name: string; status?: string }[] } | { id: string; name: string; status?: string }[];
      };
      const rawList = Array.isArray(list.data)
        ? list.data
        : (list.data?.data ?? []);
      const match = rawList.find((d) => d.name?.toLowerCase() === domain);

      if (!match) {
        domainStatus = "not_found";
      } else {
        const detail = (await resend.domains.get(match.id)) as {
          data?: { status?: string; records?: DomainRecord[] };
        };
        const status = detail.data?.status ?? match.status ?? "";
        domainStatus = status === "verified" ? "verified" : "not_verified";
        records = detail.data?.records ?? [];
      }
    } catch (err) {
      console.error("[email-setup/check] Resend-Abfrage fehlgeschlagen:", err);
      domainStatus = "unknown";
    }
  }

  return NextResponse.json({
    code: "EMAIL_SETUP_CHECKED",
    hasApiKey,
    hasFromEmail,
    fromEmail,
    domain,
    isTestDomain,
    domainStatus,
    records,
  });
}

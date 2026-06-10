/**
 * POST /api/admin/ceo-launch/qa-check
 *
 * Product QA Agent – prüft öffentliche Launch-Seiten auf Erreichbarkeit.
 * Nur für Admins. READ-ONLY. Keine Datenveränderung.
 * Keine automatische Kommunikation.
 *
 * Checks:
 * - HTTP 200 für alle öffentlichen Launch-Seiten
 * - HTTP 200 für Demo-Buchungslink
 * - HTTP 200 für Sitemap + robots.txt
 * - /dashboard ist geschützt (kein 200 bei unauthenticated)
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { CANONICAL_URL } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "warn" | "error";

type QaCheck = {
  id: string;
  label: string;
  url: string;
  expected: string;
  actual: string;
  status: CheckStatus;
  detail: string | null;
};

async function fetchStatus(
  url: string,
  timeoutMs: number = 8000,
): Promise<{ status: number; ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "ClinicSlotHub-QA/1.0" },
    });
    clearTimeout(timer);
    return { status: res.status, ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 80) : "Unbekannter Fehler";
    return { status: 0, ok: false, error: msg };
  }
}

function check(
  id: string,
  label: string,
  url: string,
  actualStatus: number,
  error: string | undefined,
  expectedStatus: number,
  invertedCheck = false, // true = erwartet NICHT 200 (z. B. /dashboard)
): QaCheck {
  let status: CheckStatus;
  let detail: string | null = null;

  if (error) {
    status = "error";
    detail = `Netzwerkfehler: ${error}`;
  } else if (invertedCheck) {
    // /dashboard soll NICHT 200 zurückgeben (soll redirecten/schützen)
    if (actualStatus !== 200) {
      status = "ok";
      detail = `Geschützt: HTTP ${actualStatus} (kein 200)`;
    } else {
      status = "error";
      detail = `Dashboard gibt 200 zurück – möglicherweise nicht geschützt`;
    }
  } else {
    if (actualStatus === expectedStatus) {
      status = "ok";
    } else if (actualStatus === 0) {
      status = "error";
      detail = "Nicht erreichbar";
    } else {
      status = "warn";
      detail = `Erwartet ${expectedStatus}, erhalten ${actualStatus}`;
    }
  }

  return {
    id,
    label,
    url,
    expected: invertedCheck ? `nicht 200` : `HTTP ${expectedStatus}`,
    actual: error ? "Fehler" : `HTTP ${actualStatus}`,
    status,
    detail,
  };
}

export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Alle URLs parallel prüfen
  const urls = [
    { id: "launch_de", label: "Launch-Seite DE", url: `${CANONICAL_URL}/de/launch`, expected: 200 },
    { id: "launch_en", label: "Launch-Seite EN", url: `${CANONICAL_URL}/en/launch`, expected: 200 },
    { id: "share_de", label: "Share Kit DE", url: `${CANONICAL_URL}/de/share`, expected: 200 },
    { id: "share_en", label: "Share Kit EN", url: `${CANONICAL_URL}/en/share`, expected: 200 },
    { id: "public_launch_de", label: "Public Launch Hub DE", url: `${CANONICAL_URL}/de/public-launch`, expected: 200 },
    { id: "book_demo", label: "Demo-Buchungslink /book/testpraxis-delta", url: `${CANONICAL_URL}/book/testpraxis-delta`, expected: 200 },
    { id: "sitemap", label: "Sitemap XML", url: `${CANONICAL_URL}/sitemap.xml`, expected: 200 },
    { id: "robots", label: "robots.txt", url: `${CANONICAL_URL}/robots.txt`, expected: 200 },
    { id: "homepage_de", label: "Homepage DE", url: `${CANONICAL_URL}/de`, expected: 200 },
    { id: "homepage_en", label: "Homepage EN", url: `${CANONICAL_URL}/en`, expected: 200 },
  ];

  // /dashboard separat (erwartet Schutz → NICHT 200)
  const dashboardUrl = `${CANONICAL_URL}/dashboard`;

  const [dashboardResult, ...urlResults] = await Promise.all([
    fetchStatus(dashboardUrl),
    ...urls.map((u) => fetchStatus(u.url)),
  ]);

  const checks: QaCheck[] = [
    ...urls.map((u, i) =>
      check(u.id, u.label, u.url, urlResults[i].status, urlResults[i].error, u.expected),
    ),
    check(
      "dashboard_protected",
      "Dashboard geschützt (kein 200 ohne Login)",
      dashboardUrl,
      dashboardResult.status,
      dashboardResult.error,
      200,
      true, // invertedCheck
    ),
  ];

  const okCount = checks.filter((c) => c.status === "ok").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const errorCount = checks.filter((c) => c.status === "error").length;

  const overallStatus: CheckStatus =
    errorCount > 0 ? "error" : warnCount > 0 ? "warn" : "ok";

  return NextResponse.json({
    code: "QA_CHECK_DONE",
    overall_status: overallStatus,
    ok_count: okCount,
    warn_count: warnCount,
    error_count: errorCount,
    total: checks.length,
    checks,
    checked_at: new Date().toISOString(),
  });
}

/**
 * GET  /api/admin/go-live/confirmations – Alle Bestätigungen laden
 * POST /api/admin/go-live/confirmations – Eine Bestätigung setzen
 *
 * Nur für Admins. Keine automatischen Aktionen. Keine echten Nachrichten.
 * Jede Bestätigung wird audit-geloggt.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getAdminContext } from "@/lib/admin";
import {
  getConfirmations,
  setConfirmation,
  MANUAL_CONFIRMATION_KEYS,
  type ManualConfirmationKey,
} from "@/lib/go-live-confirmations";
import { assertNoSecretsInResponse } from "@/lib/security-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET: alle Bestätigungen laden ────────────────────────────────────────────

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const confirmations = await getConfirmations(ctx.admin);

    const payload = { code: "CONFIRMATIONS_LOADED", confirmations };

    if (!assertNoSecretsInResponse(payload)) {
      return NextResponse.json({ code: "GO_LIVE_ERROR" }, { status: 500 });
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[GET /api/admin/go-live/confirmations] Fehler:", err);
    return NextResponse.json({ code: "GO_LIVE_ERROR" }, { status: 500 });
  }
}

// ─── POST: eine Bestätigung setzen ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const key = (body as Record<string, unknown>)?.key as
    | ManualConfirmationKey
    | undefined;

  if (!key || !MANUAL_CONFIRMATION_KEYS.includes(key)) {
    return NextResponse.json(
      {
        code: "INVALID_KEY",
        validKeys: MANUAL_CONFIRMATION_KEYS,
      },
      { status: 400 },
    );
  }

  try {
    await setConfirmation(
      ctx.admin,
      key,
      ctx.user.email ?? "admin",
      ctx.user.id,
    );

    return NextResponse.json({
      code: "CONFIRMATION_SAVED",
      key,
      confirmedBy: ctx.user.email ?? "admin",
      confirmedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[POST /api/admin/go-live/confirmations] Fehler:", err);
    return NextResponse.json({ code: "GO_LIVE_ERROR" }, { status: 500 });
  }
}

/**
 * GET   /api/admin/booking-requests  – Liste aller Buchungsanfragen
 * PATCH /api/admin/booking-requests  – Status einer Anfrage ändern
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang
 * - Keine automatische Benachrichtigung direkt nach Patienten-Anfrage
 * - E-Mail ERST nach manuellem Admin-Klick (confirm/decline)
 * - Manuelle Bestätigung / Ablehnung
 * - auto_confirmed bleibt false außer explizit konfiguriert
 * - RESEND_API_KEY niemals in Client-Responses
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import {
  sendBookingEmail,
  isBookingEmailEnabled,
  type BookingEmailData,
} from "@/lib/booking-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = ctx.admin
    .from("booking_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === "pending") query = query.eq("status", "pending_confirmation");
  else if (filter === "confirmed") query = query.eq("status", "confirmed");
  else if (filter === "declined") query = query.eq("status", "declined");
  else if (filter === "cancelled") query = query.eq("status", "cancelled");

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data, total: count ?? 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }

  const { id, action, internal_note } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
  }

  // Für confirm/decline: Buchungsdaten vor dem Update laden (für E-Mail-Versand)
  let bookingData: BookingEmailData | null = null;
  if (action === "confirm" || action === "decline") {
    const { data: existing, error: fetchError } = await ctx.admin
      .from("booking_requests")
      .select("id, patient_name, patient_email, preferred_time, note, tenant_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Buchungsanfrage nicht gefunden" },
        { status: 404 },
      );
    }
    bookingData = existing as BookingEmailData;
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (internal_note && typeof internal_note === "string") {
    updates.internal_note = internal_note.slice(0, 1000);
  }

  switch (action) {
    case "confirm":
      updates.status = "confirmed";
      break;
    case "decline":
      updates.status = "declined";
      break;
    case "cancel":
      updates.status = "cancelled";
      break;
    case "set_pending":
      updates.status = "pending_confirmation";
      break;
    case "add_note":
      // Nur Notiz hinzufügen, kein Status-Wechsel
      break;
    default:
      return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 400 });
  }

  const { error } = await ctx.admin
    .from("booking_requests")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  // Keine automatische Benachrichtigung direkt nach Patienten-Anfrage.
  // E-Mail ERST nach manuellem Admin-Klick (confirm/decline).
  // RESEND_API_KEY und Patientendaten werden NIE in der Response ausgegeben.
  let emailStatus: string | null = null;
  let emailCode: string | null = null;

  if ((action === "confirm" || action === "decline") && bookingData) {
    const emailType = action === "confirm" ? "confirmation" : "decline";
    const result = await sendBookingEmail(bookingData, emailType, ctx.user.email ?? null);
    emailStatus = result.status;
    emailCode = result.code;
  }

  const response: Record<string, unknown> = {
    code: "OK",
    id,
    action,
    email_notifications_enabled: isBookingEmailEnabled(),
  };

  // E-Mail-Status zurückgeben (kein Secret, keine Patientendaten)
  if (emailStatus !== null) {
    response.email_status = emailStatus;
    response.email_code = emailCode;
  }

  return NextResponse.json(response);
}

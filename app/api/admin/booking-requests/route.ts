/**
 * GET   /api/admin/booking-requests  – Liste aller Buchungsanfragen
 * PATCH /api/admin/booking-requests  – Status einer Anfrage ändern
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang
 * - Keine automatische Benachrichtigung direkt nach Patienten-Anfrage
 * - E-Mail ERST nach manuellem Admin-Klick (confirm/decline)
 * - Archivieren = Soft-Delete (kein hartes DELETE, keine E-Mail)
 * - auto_confirmed bleibt false außer Slot-Check erfolgt
 * - RESEND_API_KEY niemals in Client-Responses
 * - Keine automatische Benachrichtigung beim Archivieren
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import {
  sendBookingEmail,
  isBookingEmailEnabled,
  type BookingEmailData,
} from "@/lib/booking-email";
import { writeAuditLog } from "@/lib/audit-log";

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

  // Archived-Filter: nur archivierte anzeigen
  if (filter === "archived") {
    query = query.eq("status", "archived");
  } else {
    // Alle anderen Filter: archivierte ausblenden
    query = query.neq("status", "archived");
    if (filter === "pending") query = query.eq("status", "pending_confirmation");
    else if (filter === "confirmed") query = query.eq("status", "confirmed");
    else if (filter === "declined") query = query.eq("status", "declined");
    else if (filter === "cancelled") query = query.eq("status", "cancelled");
  }

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

  const { id, action, internal_note, confirmed_date, confirmed_time } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
  }

  // Für confirm/decline/archive: Buchungsdaten vor dem Update laden
  let bookingData: BookingEmailData | null = null;
  if (action === "confirm" || action === "confirm_with_slot" || action === "decline") {
    const { data: existing, error: fetchError } = await ctx.admin
      .from("booking_requests")
      .select(
        "id, patient_name, patient_email, preferred_time, note, tenant_id, " +
        "confirmed_date, confirmed_time",
      )
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Buchungsanfrage nicht gefunden" },
        { status: 404 },
      );
    }
    bookingData = existing as unknown as BookingEmailData;
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    updated_at: now,
  };

  if (internal_note && typeof internal_note === "string") {
    updates.internal_note = internal_note.slice(0, 1000);
  }

  switch (action) {
    case "confirm":
      // Einfache Bestätigung ohne konkreten Slot
      updates.status = "confirmed";
      updates.confirmation_mode = "manual";
      break;

    case "confirm_with_slot":
      // Bestätigung MIT konkretem Datum + Uhrzeit (Admin wählt Slot)
      if (
        !confirmed_date ||
        typeof confirmed_date !== "string" ||
        !confirmed_time ||
        typeof confirmed_time !== "string"
      ) {
        return NextResponse.json(
          { code: "MISSING_SLOT", message: "confirmed_date und confirmed_time erforderlich" },
          { status: 400 },
        );
      }
      updates.status = "confirmed";
      updates.confirmation_mode = "manual";
      updates.confirmed_date = confirmed_date;
      updates.confirmed_time = confirmed_time;
      // bookingData mit konkretem Slot anreichern für E-Mail
      if (bookingData) {
        bookingData.confirmed_date = confirmed_date;
        bookingData.confirmed_time = confirmed_time;
      }
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

    case "archive":
      // Soft-Delete: Archivieren ohne E-Mail
      // Keine automatische Benachrichtigung beim Archivieren.
      updates.status = "archived";
      updates.archived_at = now;
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
  // Archivieren sendet KEINE E-Mail.
  // RESEND_API_KEY und Patientendaten werden NIE in der Response ausgegeben.
  let emailStatus: string | null = null;
  let emailCode: string | null = null;

  const sendsEmail =
    action === "confirm" || action === "confirm_with_slot" || action === "decline";

  if (sendsEmail && bookingData) {
    const emailType = action === "decline" ? "decline" : "confirmation";
    const result = await sendBookingEmail(bookingData, emailType, ctx.user.email ?? null);
    emailStatus = result.status;
    emailCode = result.code;

    // E-Mail-Status in DB speichern (nur Code, kein Secret)
    await ctx.admin
      .from("booking_requests")
      .update({
        email_status: result.status,
        email_sent_at: result.status === "sent" ? now : null,
      })
      .eq("id", id);
  }

  // Archivierungs-Audit (keine E-Mail, kein Secret)
  if (action === "archive") {
    await writeAuditLog({
      action: "booking_archived",
      area: "booking",
      status: "success",
      actorEmail: ctx.user.email ?? null,
      metadata: { booking_id: id },
    });
  }

  const response: Record<string, unknown> = {
    code: "OK",
    id,
    action,
    email_notifications_enabled: isBookingEmailEnabled(),
  };

  if (emailStatus !== null) {
    response.email_status = emailStatus;
    response.email_code = emailCode;
  }

  return NextResponse.json(response);
}

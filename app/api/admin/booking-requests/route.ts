/**
 * GET   /api/admin/booking-requests  – Liste aller Buchungsanfragen
 * PATCH /api/admin/booking-requests  – Status einer Anfrage ändern
 *
 * PATCH-Actions:
 *   confirm                – Bestätigen (ohne Datum; kopiert requested_date/time wenn vorhanden)
 *   confirm_with_datetime  – Bestätigen MIT Datum/Uhrzeit (confirmed_date + confirmed_time)
 *   decline                – Ablehnen
 *   cancel                 – Absagen (nach Bestätigung)
 *   set_pending            – Zurück auf ausstehend
 *   add_note               – Interne Notiz hinzufügen
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang
 * - Keine automatische Benachrichtigung direkt nach Patienten-Anfrage
 * - E-Mail ERST nach manuellem Admin-Klick (confirm/decline)
 * - auto_confirmed bleibt false außer explizit konfiguriert
 * - confirmed_date / confirmed_time: nur gültige Formate werden gespeichert
 */
// RESEND_API_KEY niemals in Client-Responses zurückgeben

import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import {
  sendBookingEmail,
  isBookingEmailEnabled,
  type BookingEmailData,
} from "@/lib/booking-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── GET ───────────────────────────────────────────────────────────────────

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
  // Nur echte Anfragen (is_test IS NULL oder IS FALSE)
  else if (filter === "real")
    query = query.or("is_test.is.null,is_test.eq.false");
  // Nur Testdaten
  else if (filter === "test") query = query.eq("is_test", true);

  const { data, error, count } = await query;

  // Anzahl echter (nicht-Test) Anfragen – für korrekten Lead-Zähler
  const { count: realTotal } = await ctx.admin
    .from("booking_requests")
    .select("*", { count: "exact", head: true })
    .or("is_test.is.null,is_test.eq.false");
  if (error) {
    return NextResponse.json(
      { code: "DB_ERROR", message: error.message },
      { status: 500 },
    );
  }

  // Meta: Auto-Confirm und E-Mail aktiv? (für Admin-Banner)
  let autoConfirmActive = false;
  try {
    // Praxis mit aktivem Abo suchen
    const { data: activeSub } = await ctx.admin
      .from("subscriptions")
      .select("practice_id")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const pid = (activeSub as { practice_id?: string } | null)?.practice_id;
    if (pid) {
      const { data: practice } = await ctx.admin
        .from("practices")
        .select("auto_confirm_bookings")
        .eq("id", pid)
        .maybeSingle();
      autoConfirmActive =
        (practice as { auto_confirm_bookings?: boolean } | null)
          ?.auto_confirm_bookings === true;
    }
  } catch {
    /* Meta darf GET nie crashen */
  }

  return NextResponse.json({
    requests: data,
    total: count ?? 0,
    real_total: realTotal ?? 0,
    page,
    limit,
    auto_confirm_active: autoConfirmActive,
    email_notifications_active: isBookingEmailEnabled(),
  });
}

// ─── PATCH ─────────────────────────────────────────────────────────────────

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

  // Buchungsdaten für E-Mail-Versand laden (confirm / confirm_with_datetime / decline)
  let bookingData: BookingEmailData | null = null;
  if (
    action === "confirm" ||
    action === "confirm_with_datetime" ||
    action === "decline"
  ) {
    const { data: existing, error: fetchError } = await ctx.admin
      .from("booking_requests")
      .select(
        "id, patient_name, patient_email, preferred_time, note, tenant_id, " +
          "requested_date, requested_time, confirmed_date, confirmed_time",
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

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (internal_note && typeof internal_note === "string") {
    updates.internal_note = internal_note.slice(0, 1000);
  }

  switch (action) {
    case "confirm":
      updates.status = "confirmed";
      // Wenn Patient konkret Slot gewählt hat: als confirmed_date/time übernehmen
      if (bookingData) {
        if (bookingData.requested_date && !bookingData.confirmed_date) {
          updates.confirmed_date = bookingData.requested_date;
          updates.confirmed_time = bookingData.requested_time ?? null;
        }
      }
      break;

    case "confirm_with_datetime": {
      // Bestätigen mit explizitem Datum und Uhrzeit
      const cd = body.confirmed_date;
      const ct = body.confirmed_time;
      if (typeof cd !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(cd)) {
        return NextResponse.json(
          {
            code: "INVALID_DATE",
            message: "confirmed_date muss Format YYYY-MM-DD haben",
          },
          { status: 400 },
        );
      }
      if (typeof ct !== "string" || !/^\d{2}:\d{2}$/.test(ct)) {
        return NextResponse.json(
          {
            code: "INVALID_TIME",
            message: "confirmed_time muss Format HH:MM haben",
          },
          { status: 400 },
        );
      }
      updates.status = "confirmed";
      updates.confirmed_date = cd;
      updates.confirmed_time = ct;
      // bookingData für E-Mail mit den bestätigten Werten anreichern
      if (bookingData) {
        bookingData = { ...bookingData, confirmed_date: cd, confirmed_time: ct };
      }
      break;
    }

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
    return NextResponse.json(
      { code: "DB_ERROR", message: error.message },
      { status: 500 },
    );
  }

  // E-Mail nach manuellem Klick (confirm / confirm_with_datetime / decline)
  let emailStatus: string | null = null;
  let emailCode: string | null = null;

  if (
    (action === "confirm" || action === "confirm_with_datetime" || action === "decline") &&
    bookingData
  ) {
    const emailType = action === "decline" ? "decline" : "confirmation";
    // confirmed_date/time für confirm-Aktion aus updates übernehmen
    const emailData: BookingEmailData = {
      ...bookingData,
      confirmed_date:
        (updates.confirmed_date as string | undefined) ??
        bookingData.confirmed_date,
      confirmed_time:
        (updates.confirmed_time as string | undefined) ??
        bookingData.confirmed_time,
    };
    const result = await sendBookingEmail(emailData, emailType, ctx.user.email ?? null);
    emailStatus = result.status;
    emailCode = result.code;
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

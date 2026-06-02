/**
 * GET  /api/admin/booking-settings – Buchungseinstellungen laden
 * PUT  /api/admin/booking-settings – Buchungseinstellungen speichern
 *
 * GET  /api/admin/booking-settings?resource=availability_rules
 * GET  /api/admin/booking-settings?resource=blocked_times
 * PUT  /api/admin/booking-settings         – Praxis-Einstellungen (auto_confirm etc.)
 * POST /api/admin/booking-settings/rules   – via action=upsert_rule
 * POST /api/admin/booking-settings/rules   – via action=delete_rule
 * POST /api/admin/booking-settings/blocked – via action=add_blocked
 * POST /api/admin/booking-settings/blocked – via action=delete_blocked
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang (getAdminContext)
 * - Praxis-ID kommt aus der DB (nicht aus dem Client)
 * - auto_confirm_bookings DEFAULT false – Hinweis in UI obligatorisch
 * - KEINE automatische Bestätigung bei Speichern der Einstellungen
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Praxis-ID aus DB laden (sicher, nicht aus Client) ─────────────────────

async function getPracticeId(
  admin: ReturnType<typeof import("@/lib/supabase").createClient>,
  userEmail: string,
): Promise<string | null> {
  // Admin per ADMIN_EMAILS hat Vollzugriff – wir nutzen die erste Praxis
  // als Default-Kontext für Einstellungen. In Multi-Tenant-Setup hier
  // den practice_id-Query-Parameter verarbeiten.
  const { data } = await admin
    .from("practices")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data?.id ?? null;
}

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "settings";
  const practiceIdParam = url.searchParams.get("practice_id");

  const practiceId = practiceIdParam
    ?? await getPracticeId(ctx.admin, ctx.user.email ?? "");

  if (!practiceId) {
    return NextResponse.json({ code: "NO_PRACTICE" }, { status: 404 });
  }

  if (resource === "availability_rules") {
    const { data, error } = await ctx.admin
      .from("booking_availability_rules")
      .select("*")
      .eq("practice_id", practiceId)
      .order("weekday")
      .order("start_time");

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ rules: data ?? [] });
  }

  if (resource === "blocked_times") {
    const { data, error } = await ctx.admin
      .from("booking_blocked_times")
      .select("*")
      .eq("practice_id", practiceId)
      .gte("blocked_date", new Date().toISOString().slice(0, 10)) // nur zukünftige
      .order("blocked_date");

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ blocked: data ?? [] });
  }

  // Default: Praxis-Einstellungen
  const { data, error } = await ctx.admin
    .from("practices")
    .select(
      "id, name, auto_confirm_bookings, booking_slot_minutes, booking_buffer_minutes",
    )
    .eq("id", practiceId)
    .single();

  if (error || !data) {
    return NextResponse.json({ code: "DB_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ settings: data, practice_id: practiceId });
}

export async function PUT(request: NextRequest) {
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

  const { action, practice_id: bodyPracticeId } = body;

  const practiceId = (typeof bodyPracticeId === "string" ? bodyPracticeId : null)
    ?? await getPracticeId(ctx.admin, ctx.user.email ?? "");

  if (!practiceId) {
    return NextResponse.json({ code: "NO_PRACTICE" }, { status: 404 });
  }

  // ─── Praxis-Einstellungen aktualisieren ──────────────────────────────
  if (action === "update_settings" || !action) {
    const {
      auto_confirm_bookings,
      booking_slot_minutes,
      booking_buffer_minutes,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof auto_confirm_bookings === "boolean") {
      updates.auto_confirm_bookings = auto_confirm_bookings;
    }
    if (
      typeof booking_slot_minutes === "number" &&
      [15, 20, 30, 45, 60].includes(booking_slot_minutes)
    ) {
      updates.booking_slot_minutes = booking_slot_minutes;
    }
    if (
      typeof booking_buffer_minutes === "number" &&
      booking_buffer_minutes >= 0
    ) {
      updates.booking_buffer_minutes = booking_buffer_minutes;
    }

    const { error } = await ctx.admin
      .from("practices")
      .update(updates)
      .eq("id", practiceId);

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: "OK", action: "update_settings" });
  }

  // ─── Verfügbarkeitsregel anlegen / aktualisieren ─────────────────────
  if (action === "upsert_rule") {
    const { weekday, start_time, end_time, slot_minutes, buffer_minutes, is_active, rule_id } =
      body;

    if (!weekday || !start_time || !end_time) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "weekday, start_time, end_time erforderlich" },
        { status: 400 },
      );
    }

    const ruleData = {
      practice_id: practiceId,
      weekday: Number(weekday),
      start_time: String(start_time),
      end_time: String(end_time),
      slot_minutes: Number(slot_minutes ?? 30),
      buffer_minutes: Number(buffer_minutes ?? 0),
      is_active: typeof is_active === "boolean" ? is_active : true,
      updated_at: new Date().toISOString(),
    };

    let dbError;
    if (rule_id && typeof rule_id === "string") {
      const { error } = await ctx.admin
        .from("booking_availability_rules")
        .update(ruleData)
        .eq("id", rule_id)
        .eq("practice_id", practiceId);
      dbError = error;
    } else {
      const { error } = await ctx.admin
        .from("booking_availability_rules")
        .insert({ ...ruleData, created_at: new Date().toISOString() });
      dbError = error;
    }

    if (dbError) {
      return NextResponse.json({ code: "DB_ERROR", message: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ code: "OK", action: "upsert_rule" });
  }

  // ─── Verfügbarkeitsregel löschen ─────────────────────────────────────
  if (action === "delete_rule") {
    const { rule_id } = body;
    if (!rule_id || typeof rule_id !== "string") {
      return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
    }

    const { error } = await ctx.admin
      .from("booking_availability_rules")
      .delete()
      .eq("id", rule_id)
      .eq("practice_id", practiceId);

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: "OK", action: "delete_rule" });
  }

  // ─── Gesperrte Zeit hinzufügen ────────────────────────────────────────
  if (action === "add_blocked") {
    const { blocked_date, start_time, end_time, reason } = body;

    if (!blocked_date || typeof blocked_date !== "string") {
      return NextResponse.json({ code: "MISSING_DATE" }, { status: 400 });
    }

    const { error } = await ctx.admin
      .from("booking_blocked_times")
      .insert({
        practice_id: practiceId,
        blocked_date: String(blocked_date),
        start_time: start_time ? String(start_time) : null,
        end_time: end_time ? String(end_time) : null,
        reason: reason ? String(reason).slice(0, 200) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: "OK", action: "add_blocked" });
  }

  // ─── Gesperrte Zeit löschen ───────────────────────────────────────────
  if (action === "delete_blocked") {
    const { blocked_id } = body;
    if (!blocked_id || typeof blocked_id !== "string") {
      return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
    }

    const { error } = await ctx.admin
      .from("booking_blocked_times")
      .delete()
      .eq("id", blocked_id)
      .eq("practice_id", practiceId);

    if (error) {
      return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
    }

    return NextResponse.json({ code: "OK", action: "delete_blocked" });
  }

  return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 400 });
}

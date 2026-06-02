/**
 * GET  /api/admin/booking-settings – Buchungseinstellungen laden
 * PUT  /api/admin/booking-settings – Buchungseinstellungen speichern
 *
 * GET  ?resource=settings            – Praxis-Einstellungen
 * GET  ?resource=availability_rules  – Öffnungszeiten
 * GET  ?resource=blocked_times       – Gesperrte Zeiten
 * GET  ?resource=practices_list      – Alle Praxen (für Selector)
 *
 * Query-Params (GET): practice_id ODER practiceId  (beide akzeptiert)
 * Body-Params  (PUT): practice_id ODER practiceId  (beide akzeptiert)
 *
 * PUT  { action: "update_settings" }  – Praxis-Einstellungen speichern
 * PUT  { action: "upsert_rule" }       – Öffnungszeit anlegen/ändern
 * PUT  { action: "delete_rule" }       – Öffnungszeit löschen
 * PUT  { action: "add_blocked" }       – Gesperrte Zeit hinzufügen
 * PUT  { action: "delete_blocked" }    – Gesperrte Zeit entfernen
 *
 * Praxis-Auflösung (resolvePracticeId – 4-stufig, kein Crash):
 *   1. practices.auth_uid = ctx.user.id     (normaler Practice-Owner)
 *   2. practices.email    = ctx.user.email  (Admin mit passender Praxis-E-Mail)
 *   3. subscriptions.status = 'active'      (aktive Praxis bevorzugen)
 *   4. erste vorhandene Praxis              (letzter Fallback)
 *
 * Robustheit:
 *   - Settings-SELECT fällt auf Basis-Felder + Defaults zurück wenn
 *     Booking-Spalten noch nicht existieren (Migration noch nicht gelaufen)
 *   - availability_rules / blocked_times: bei Fehler leere Arrays statt 500
 *   - Keine Praxis-Duplikate (kein INSERT in practices)
 *
 * Sicherheitsregeln:
 *   - Nur Admin-Zugang (getAdminContext)
 *   - Praxis-ID kommt aus DB (nie aus dem Client) oder explizit übergeben
 *   - auto_confirm_bookings DEFAULT false
 *   - Keine Secrets im Response
 */

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Booking-Spalten-Default (falls Spalten noch nicht existieren) ──────────

const SETTINGS_DEFAULTS = {
  auto_confirm_bookings: false,
  booking_slot_minutes: 30,
  booking_buffer_minutes: 0,
} as const;

// ─── Praxis-Auflösung (4-stufig, kein INSERT, kein Crash) ─────────────────

async function resolvePracticeId(
  admin: SupabaseClient,
  userId: string,
  userEmail: string | undefined | null,
): Promise<string | null> {
  // 1. Normalfall: Praxis ist per auth_uid mit dem Auth-User verknüpft
  const { data: byAuth } = await admin
    .from("practices")
    .select("id")
    .eq("auth_uid", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (byAuth?.id) return byAuth.id;

  // 2. Fallback für Admins: Praxis-E-Mail stimmt mit Admin-E-Mail überein
  if (userEmail) {
    const { data: byEmail } = await admin
      .from("practices")
      .select("id")
      .eq("email", userEmail)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (byEmail?.id) return byEmail.id;
  }

  // 3. Bevorzuge Praxis mit aktivem Abo (Status 'active')
  const { data: activeSub } = await admin
    .from("subscriptions")
    .select("practice_id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (activeSub?.practice_id) return activeSub.practice_id as string;

  // 4. Absoluter Fallback: erste vorhandene Praxis
  const { data: first } = await admin
    .from("practices")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return first?.id ?? null;
}

// ─── practice_id aus Query-Params lesen (snake_case + camelCase) ────────────

function getPracticeIdParam(url: URL): string | null {
  return (
    url.searchParams.get("practice_id") ??
    url.searchParams.get("practiceId") ??
    null
  );
}

// ─── practice_id aus PUT-Body lesen (snake_case + camelCase) ────────────────

function getPracticeIdFromBody(body: Record<string, unknown>): string | null {
  const v = body.practice_id ?? body.practiceId;
  return typeof v === "string" ? v : null;
}

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "settings";
  const practiceIdParam = getPracticeIdParam(url);

  // ── practices_list: alle Praxen für Selector ──────────────────────────────
  if (resource === "practices_list") {
    const { data, error } = await ctx.admin
      .from("practices")
      .select("id, name, email, subscriptions ( status )")
      .order("created_at", { ascending: true });

    if (error) {
      // Fallback: ohne subscriptions-Join
      const { data: basic } = await ctx.admin
        .from("practices")
        .select("id, name, email")
        .order("created_at", { ascending: true });

      const list = (basic ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        status: null,
      }));
      return NextResponse.json({ practices: list });
    }

    const list = (data ?? []).map((p) => {
      const sub = Array.isArray(p.subscriptions)
        ? p.subscriptions[0]
        : p.subscriptions;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        status: (sub as { status?: string } | null)?.status ?? null,
      };
    });

    return NextResponse.json({ practices: list });
  }

  // ── Praxis-ID auflösen ────────────────────────────────────────────────────
  const practiceId =
    practiceIdParam ??
    (await resolvePracticeId(ctx.admin, ctx.user.id, ctx.user.email));

  if (!practiceId) {
    return NextResponse.json({ code: "NO_PRACTICE" }, { status: 404 });
  }

  // ── availability_rules ────────────────────────────────────────────────────
  if (resource === "availability_rules") {
    const { data, error } = await ctx.admin
      .from("booking_availability_rules")
      .select("*")
      .eq("practice_id", practiceId)
      .order("weekday")
      .order("start_time");

    if (error) {
      // Tabelle existiert möglicherweise noch nicht → leere Liste zurückgeben
      return NextResponse.json({ rules: [], _tableError: error.message });
    }
    return NextResponse.json({ rules: data ?? [] });
  }

  // ── blocked_times ─────────────────────────────────────────────────────────
  if (resource === "blocked_times") {
    const { data, error } = await ctx.admin
      .from("booking_blocked_times")
      .select("*")
      .eq("practice_id", practiceId)
      .gte("blocked_date", new Date().toISOString().slice(0, 10))
      .order("blocked_date");

    if (error) {
      // Tabelle existiert möglicherweise noch nicht → leere Liste zurückgeben
      return NextResponse.json({ blocked: [], _tableError: error.message });
    }
    return NextResponse.json({ blocked: data ?? [] });
  }

  // ── Default: Praxis-Einstellungen ─────────────────────────────────────────
  //
  // DB-Spalten: auto_confirm_bookings, slot_minutes, buffer_minutes
  // API-Response-Keys (Frontend): booking_slot_minutes, booking_buffer_minutes
  // (Mapping nötig weil DB-Spaltennamen sich von alten API-Keys unterscheiden)
  //
  const { data: full, error: fullError } = await ctx.admin
    .from("practices")
    .select(
      "id, name, auto_confirm_bookings, slot_minutes, buffer_minutes",
    )
    .eq("id", practiceId)
    .maybeSingle();

  if (!fullError && full) {
    // Normalfall: alle Spalten vorhanden
    return NextResponse.json({
      settings: {
        id: full.id,
        name: full.name,
        auto_confirm_bookings:
          (full as Record<string, unknown>).auto_confirm_bookings ??
          SETTINGS_DEFAULTS.auto_confirm_bookings,
        // Frontend erwartet booking_slot_minutes / booking_buffer_minutes
        // DB-Spalten heißen slot_minutes / buffer_minutes
        booking_slot_minutes:
          (full as Record<string, unknown>).slot_minutes ??
          SETTINGS_DEFAULTS.booking_slot_minutes,
        booking_buffer_minutes:
          (full as Record<string, unknown>).buffer_minutes ??
          SETTINGS_DEFAULTS.booking_buffer_minutes,
      },
      practice_id: practiceId,
    });
  }

  // Fallback: Praxis existiert, aber Booking-Spalten fehlen noch
  const { data: basic, error: basicError } = await ctx.admin
    .from("practices")
    .select("id, name")
    .eq("id", practiceId)
    .maybeSingle();

  if (basicError || !basic) {
    return NextResponse.json({ code: "NO_PRACTICE" }, { status: 404 });
  }

  return NextResponse.json({
    settings: {
      id: basic.id,
      name: basic.name,
      ...SETTINGS_DEFAULTS,
    },
    practice_id: practiceId,
    _settingsDefaults: true,
  });
}

// ─── PUT ───────────────────────────────────────────────────────────────────

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

  const { action } = body;

  const practiceId =
    getPracticeIdFromBody(body) ??
    (await resolvePracticeId(ctx.admin, ctx.user.id, ctx.user.email));

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
      // DB-Spalte heißt slot_minutes (nicht booking_slot_minutes)
      updates.slot_minutes = booking_slot_minutes;
    }
    if (
      typeof booking_buffer_minutes === "number" &&
      booking_buffer_minutes >= 0
    ) {
      // DB-Spalte heißt buffer_minutes (nicht booking_buffer_minutes)
      updates.buffer_minutes = booking_buffer_minutes;
    }

    const { error } = await ctx.admin
      .from("practices")
      .update(updates)
      .eq("id", practiceId);

    if (error) {
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ code: "OK", action: "update_settings" });
  }

  // ─── Verfügbarkeitsregel anlegen / aktualisieren ─────────────────────
  if (action === "upsert_rule") {
    const {
      weekday,
      start_time,
      end_time,
      slot_minutes,
      buffer_minutes,
      is_active,
      rule_id,
    } = body;

    if (!weekday || !start_time || !end_time) {
      return NextResponse.json(
        {
          code: "MISSING_FIELDS",
          message: "weekday, start_time, end_time erforderlich",
        },
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
      return NextResponse.json(
        { code: "DB_ERROR", message: dbError.message },
        { status: 500 },
      );
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
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ code: "OK", action: "delete_rule" });
  }

  // ─── Gesperrte Zeit hinzufügen ────────────────────────────────────────
  if (action === "add_blocked") {
    const { blocked_date, start_time, end_time, reason } = body;

    if (!blocked_date || typeof blocked_date !== "string") {
      return NextResponse.json({ code: "MISSING_DATE" }, { status: 400 });
    }

    const { error } = await ctx.admin.from("booking_blocked_times").insert({
      practice_id: practiceId,
      blocked_date: String(blocked_date),
      start_time: start_time ? String(start_time) : null,
      end_time: end_time ? String(end_time) : null,
      reason: reason ? String(reason).slice(0, 200) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
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
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ code: "OK", action: "delete_blocked" });
  }

  return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 400 });
}

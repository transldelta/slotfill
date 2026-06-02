/**
 * GET  /api/admin/booking-settings – Buchungseinstellungen laden
 * PUT  /api/admin/booking-settings – Buchungseinstellungen speichern
 *
 * GET  ?resource=settings            – Praxis-Einstellungen
 * GET  ?resource=availability_rules  – Öffnungszeiten
 * GET  ?resource=blocked_times       – Gesperrte Zeiten
 * GET  ?resource=practices_list      – Alle Praxen (für Selector)
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
 * Sicherheitsregeln:
 * - Nur Admin-Zugang (getAdminContext)
 * - Praxis-ID kommt aus DB (nie aus dem Client)
 * - auto_confirm_bookings DEFAULT false – Hinweis in UI obligatorisch
 * - KEINE automatische Bestätigung bei Speichern der Einstellungen
 * - Keine Praxis-Duplikate werden angelegt
 * - Keine Secrets im Response
 */

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get("resource") ?? "settings";
  const practiceIdParam = url.searchParams.get("practice_id");

  // practices_list: alle verfügbaren Praxen für den Auswahl-Selector
  if (resource === "practices_list") {
    const { data, error } = await ctx.admin
      .from("practices")
      .select(
        "id, name, email, subscriptions ( status )",
      )
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
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

  // Praxis-ID auflösen: explizit übergeben oder automatisch ermitteln
  const practiceId =
    practiceIdParam ??
    (await resolvePracticeId(
      ctx.admin,
      ctx.user.id,
      ctx.user.email,
    ));

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
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ rules: data ?? [] });
  }

  if (resource === "blocked_times") {
    const { data, error } = await ctx.admin
      .from("booking_blocked_times")
      .select("*")
      .eq("practice_id", practiceId)
      .gte("blocked_date", new Date().toISOString().slice(0, 10))
      .order("blocked_date");

    if (error) {
      return NextResponse.json(
        { code: "DB_ERROR", message: error.message },
        { status: 500 },
      );
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
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { code: "DB_ERROR", message: error.message },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ code: "NO_PRACTICE" }, { status: 404 });
  }

  return NextResponse.json({ settings: data, practice_id: practiceId });
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

  const { action, practice_id: bodyPracticeId } = body;

  const practiceId =
    (typeof bodyPracticeId === "string" ? bodyPracticeId : null) ??
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

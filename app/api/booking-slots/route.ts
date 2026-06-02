/**
 * GET /api/booking-slots
 *
 * Öffentlicher Endpunkt – liefert verfügbare Buchungs-Zeitfenster einer Praxis.
 * Patienten können diesen Endpoint ohne Authentifizierung aufrufen.
 *
 * Query-Params:
 *   practice_id  – UUID der Praxis (optional; Fallback: erste aktive Praxis)
 *   days_ahead   – Vorlaufzeit in Tagen (default: 14, max: 60)
 *
 * Response:
 *   {
 *     slots:     { date, time, label }[]   – verfügbare Zeitfenster
 *     has_rules: boolean                   – ob Öffnungszeiten konfiguriert sind
 *     message?:  string                    – Hinweistext wenn keine Slots
 *   }
 *
 * Sicherheitsregeln:
 *   - Keine Praxis-Secrets in der Response (nur Zeitfenster)
 *   - Keine Patientendaten
 *   - Service-Role Client (lib/supabase.ts) für DB-Zugriff
 */

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import {
  generateUpcomingSlots,
  type AvailabilityRule,
  type BlockedTime,
} from "@/lib/booking-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Praxis-Auflösung (öffentlich, 2-stufig) ──────────────────────────────

async function resolvePracticeId(
  client: SupabaseClient,
  practiceIdParam: string | null,
): Promise<string | null> {
  if (practiceIdParam) return practiceIdParam;

  // Praxis mit aktivem Abo bevorzugen
  const { data: activeSub } = await client
    .from("subscriptions")
    .select("practice_id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if ((activeSub as { practice_id?: string } | null)?.practice_id) {
    return (activeSub as { practice_id: string }).practice_id;
  }

  // Erste vorhandene Praxis als Fallback
  const { data: first } = await client
    .from("practices")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (first as { id?: string } | null)?.id ?? null;
}

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const practiceIdParam =
    url.searchParams.get("practice_id") ??
    url.searchParams.get("practiceId") ??
    null;
  const daysAhead = Math.min(
    60,
    Math.max(1, parseInt(url.searchParams.get("days_ahead") ?? "14", 10)),
  );

  const client = createClient();
  const practiceId = await resolvePracticeId(client, practiceIdParam);

  if (!practiceId) {
    return NextResponse.json({ slots: [], has_rules: false });
  }

  // ── Verfügbarkeitsregeln laden ─────────────────────────────────────────
  const { data: rulesData, error: rulesError } = await client
    .from("booking_availability_rules")
    .select("weekday, start_time, end_time, slot_minutes, buffer_minutes, is_active")
    .eq("practice_id", practiceId)
    .eq("is_active", true)
    .order("weekday")
    .order("start_time");

  if (rulesError || !rulesData || (rulesData as unknown[]).length === 0) {
    return NextResponse.json({
      slots: [],
      has_rules: false,
      message:
        "Aktuell keine Online-Zeitfenster verfügbar. Bitte Wunschzeit als Text angeben.",
    });
  }

  // ── Gesperrte Zeiten laden ─────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const { data: blockedData } = await client
    .from("booking_blocked_times")
    .select("blocked_date, start_time, end_time")
    .eq("practice_id", practiceId)
    .gte("blocked_date", today);

  // ── Slots generieren ───────────────────────────────────────────────────
  const rules = (rulesData as unknown) as AvailabilityRule[];
  const blocked = ((blockedData ?? []) as unknown) as BlockedTime[];
  const slots = generateUpcomingSlots(rules, blocked, daysAhead);

  return NextResponse.json({
    slots,
    has_rules: true,
    ...(slots.length === 0
      ? {
          message: `Keine freien Termine in den nächsten ${daysAhead} Tagen. Bitte Wunschzeit als Text angeben.`,
        }
      : {}),
  });
}

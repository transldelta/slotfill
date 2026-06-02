/**
 * GET /api/booking-slots?practice_id=xxx&date=YYYY-MM-DD
 *
 * Öffentlicher Endpunkt: gibt verfügbare Zeitfenster für eine Praxis zurück.
 *
 * Sicherheitsregeln:
 * - Nur GET (read-only)
 * - practice_id + date müssen valide sein
 * - Keine Patientendaten in der Response
 * - Keine Auflösung fremder Praxis-Daten (nur availability_rules + blocked_times)
 * - Rate-Limiting über Next.js-Edge-Rewrite empfohlen (hier: keine eigene Implementierung)
 * - Keine Garantie: Slots sind "voraussichtlich verfügbar", keine verbindliche Zusage
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getAvailableSlotsForDay } from "@/lib/booking-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const practiceId = url.searchParams.get("practice_id");
  const date = url.searchParams.get("date");

  if (!practiceId || !date) {
    return NextResponse.json(
      { code: "MISSING_PARAMS", message: "practice_id und date erforderlich" },
      { status: 400 },
    );
  }

  // Datums-Validierung: nur YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { code: "INVALID_DATE", message: "Datum muss im Format YYYY-MM-DD sein" },
      { status: 400 },
    );
  }

  // Nur zukünftige / heutige Daten erlaubt
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return NextResponse.json({ slots: [], note: "Datum liegt in der Vergangenheit" });
  }

  const supabase = createClient();
  const slots = await getAvailableSlotsForDay(supabase, practiceId, date);

  // Keine Patientendaten, keine sensiblen Felder in der Response
  return NextResponse.json({
    slots,
    date,
    note: "Slots sind voraussichtlich verfügbar. Keine verbindliche Terminzusage.",
  });
}

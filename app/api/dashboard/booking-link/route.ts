/**
 * GET /api/dashboard/booking-link
 *
 * Geschützter Endpunkt (nur für eingeloggte Praxis-Nutzer).
 * Gibt den Slug der eigenen Praxis zurück, aus dem der
 * kopierbare Buchungslink generiert wird.
 *
 * Response:
 *   { slug: string | null; booking_url: string | null }
 */

import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CANONICAL_URL = "https://clinicslothub.com";

export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const client = createClient();
  const { data, error } = await client
    .from("practices")
    .select("slug")
    .eq("id", ctx.practiceId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ code: "DB_ERROR" }, { status: 500 });
  }

  const slug = (data?.slug as string | null) ?? null;
  const bookingUrl = slug ? `${CANONICAL_URL}/book/${slug}` : null;

  return NextResponse.json({ slug, booking_url: bookingUrl });
}

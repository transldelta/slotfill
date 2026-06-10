/**
 * GET /api/practices/[slug]
 *
 * Öffentlicher Endpunkt – gibt minimale, öffentlich sichtbare
 * Praxisinformationen zurück. Wird von der Patientenseite /book/[slug]
 * aufgerufen, um den Praxisnamen anzuzeigen und die practice_id für
 * die Buchungsanfrage zu ermitteln.
 *
 * Response (nur diese drei Felder – keine sensiblen Daten):
 *   { id: string; name: string; slug: string }
 *
 * Sicherheitsregeln:
 *   - Nur id, name, slug in der Response – niemals email, phone,
 *     address, auth_uid oder sonstige interne Felder
 *   - Service-Role-Client: umgeht RLS, gibt aber nur erlaubte Felder zurück
 *   - Kein Authentifizierungs-Header nötig (öffentlich für Patienten)
 *   - 404 wenn Slug unbekannt oder leer
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug?.trim().toLowerCase();

  if (!slug || slug.length > 100) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const client = createClient();

  const { data, error } = await client
    .from("practices")
    .select("id, name, slug")   // ← nur diese drei Felder, kein email/phone/auth_uid
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[GET /api/practices/slug] DB-Fehler:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Practice not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
  });
}

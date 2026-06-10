/**
 * GET /api/admin/lead-stats
 *
 * Gibt echte vs. Test-Anfrage-Zähler zurück.
 * Testdaten (is_test=true) werden NICHT als echte Leads gezählt.
 * Wird im Admin-Übersichts-Dashboard verwendet.
 */
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const [
    realContactsRes,
    testContactsRes,
    realBookingsRes,
    testBookingsRes,
    lastRealContactRes,
    lastRealBookingRes,
  ] = await Promise.all([
    // Echte Kontaktnachrichten (is_test IS NULL oder IS FALSE)
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .or("is_test.is.null,is_test.eq.false"),
    // Test-Kontaktnachrichten
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_test", true),
    // Echte Buchungsanfragen
    admin
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .or("is_test.is.null,is_test.eq.false"),
    // Test-Buchungsanfragen
    admin
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .eq("is_test", true),
    // Letzte echte Kontaktanfrage
    admin
      .from("contact_messages")
      .select("created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Letzte echte Buchungsanfrage
    admin
      .from("booking_requests")
      .select("created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    real_contacts: realContactsRes.count ?? 0,
    test_contacts: testContactsRes.count ?? 0,
    real_bookings: realBookingsRes.count ?? 0,
    test_bookings: testBookingsRes.count ?? 0,
    last_real_contact_at:
      (lastRealContactRes.data as { created_at: string } | null)
        ?.created_at ?? null,
    last_real_booking_at:
      (lastRealBookingRes.data as { created_at: string } | null)
        ?.created_at ?? null,
  });
}

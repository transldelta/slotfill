import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/contact-messages – alle Kontaktnachrichten lesen (nur Admins)
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, locale, status, is_test, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[contact-messages] GET error:", error.message);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}

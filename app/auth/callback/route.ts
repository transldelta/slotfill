import { NextResponse } from "next/server";
import { createClient, createServerClient } from "@/lib/supabase";
import { ensureOnboarding } from "@/lib/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /auth/callback – Ziel des E-Mail-Bestätigungslinks.
// Tauscht den Code gegen eine Session, stellt das Onboarding sicher und
// leitet anschließend ins Dashboard weiter.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  const supabase = createServerClient();

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error("[auth/callback] Code-Austausch fehlgeschlagen:", err);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      const admin = createClient();
      await ensureOnboarding(admin, user);
    } catch (err) {
      console.error("[auth/callback] Onboarding fehlgeschlagen:", err);
    }
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  // Keine Session (z. B. abweichender Bestätigungs-Flow) -> zum Login.
  return NextResponse.redirect(`${appUrl}/auth/login`);
}

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// ── next-intl Middleware für öffentliche Locale-Routen ────────────────────────
// Erkennt /de, /en, /es usw., setzt Locale-Header für getRequestConfig,
// und leitet / auf /de (oder Accept-Language-Ergebnis) um.
// Keine Cookies für Sprachpräferenz.
const handleIntl = createIntlMiddleware(routing);

// ── Pfade mit Supabase-Auth-Schutz ────────────────────────────────────────────
const AUTH_PROTECTED = ["/admin", "/dashboard"];

// ── Pfade, die komplett durchgeleitet werden (kein i18n, kein Auth) ───────────
const PASSTHROUGH = ["/api", "/auth"];

// ── Canonical-Domain-Schutz ───────────────────────────────────────────────────
// Nur diese Hosts dürfen den Inhalt direkt ausliefern.
// Alles andere (z. B. slotfill-pi.vercel.app) wird per 301 auf die
// kanonische Domain weitergeleitet – Pfad und Query bleiben erhalten.
const CANONICAL_HOSTS = new Set(["clinicslothub.com", "www.clinicslothub.com"]);

/** Gibt true zurück, wenn der Host eine lokale Entwicklungsumgebung ist. */
function isDevHost(host: string): boolean {
  const hostname = host.split(":")[0]; // Port entfernen
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Canonical-Domain-Redirect ─────────────────────────────────────────────
  //    Läuft VOR Auth und i18n – kein API-/Auth-Pfad ist ausgenommen,
  //    weil alte Aliases niemals API-Calls empfangen sollen.
  //    Ausnahme: lokale Entwicklung (localhost, 127.0.0.1, *.local).
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];
  if (!CANONICAL_HOSTS.has(hostname) && !isDevHost(host)) {
    const target = request.nextUrl.clone();
    target.protocol = "https:";
    target.host = "clinicslothub.com";
    target.port = "";
    // Pfad und Suchparameter bleiben unverändert erhalten.
    return NextResponse.redirect(target, { status: 301 });
  }

  // 1. API- und Auth-Routen: direkt durchlassen, keine Änderung
  if (PASSTHROUGH.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. /admin und /dashboard: Supabase-Auth-Check (Login-Pflicht)
  //    Nur erreichbar von canonical hosts (oben bereits gesichert).
  //    /admin wird NICHT auf /de/admin umgeleitet.
  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p))) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: {
              name: string;
              value: string;
              options: CookieOptions;
            }[],
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 3. Alle anderen (öffentlichen) Pfade: next-intl Locale-Routing
  //    - / → redirect zu /de oder passend zu Accept-Language-Header
  //    - /en, /de etc. → Locale-Header setzen und durchlassen
  //    - /pricing → redirect zu /de/pricing oder /en/pricing
  //    Keine Cookies gesetzt.
  return handleIntl(request);
}

// Matcher: Läuft für ALLE Pfade außer statischen Build-Artefakten.
// next-intl erkennt bereits lokalisierte Pfade selbst → keine Endlosschleifen.
export const config = {
  matcher: [
    /*
     * Alle Pfade matchen, außer:
     * - _next/static  (Next.js statische Build-Dateien)
     * - _next/image   (Next.js Bild-Optimierung)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Dateien mit Extension (.png, .jpg, .svg, .ico …)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};

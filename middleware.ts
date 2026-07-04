import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing, RETIRED_LOCALES } from "@/i18n/routing";

// ── next-intl Middleware für öffentliche Locale-Routen ────────────────────────
// Erkennt /de, /en, /es usw., setzt Locale-Header für getRequestConfig,
// und leitet / (und unprefixte Pfade) auf /en um (Default-Locale, keine
// Accept-Language-Detection – siehe i18n/routing.ts).
// Keine Cookies für Sprachpräferenz.
const handleIntl = createIntlMiddleware(routing);

// ── Pfade mit Supabase-Auth-Schutz ────────────────────────────────────────────
const AUTH_PROTECTED = ["/admin", "/dashboard"];

// ── Pfade, die komplett durchgeleitet werden (kein i18n, kein Auth) ───────────
// /book: öffentliche Patientenseiten – kein Locale-Prefix nötig/gewünscht
const PASSTHROUGH = ["/api", "/auth", "/book"];

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

  // 1a. Stillgelegte Sprachen (ar, hi, bn, ru, zh) → 308 auf /en ───────────────
  //     Nicht mehr öffentlich aktiv. Ziel ist immer /en (selbst aktiv) → kein Loop.
  const retiredSeg = pathname.replace(/^\/+/, "").split("/")[0];
  if ((RETIRED_LOCALES as readonly string[]).includes(retiredSeg)) {
    const url = request.nextUrl.clone();
    url.pathname = "/en" + pathname.slice(retiredSeg.length + 1);
    return NextResponse.redirect(url, { status: 308 });
  }

  // 2. /admin und /dashboard: Supabase-Auth-Check (Login-Pflicht)
  //    Nur erreichbar von canonical hosts (oben bereits gesichert).
  //    /admin wird NICHT auf /de/admin umgeleitet.
  if (AUTH_PROTECTED.some((p) => pathname.startsWith(p))) {
    const loginRedirect = () => {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    };

    // Fail-closed: jeder Auth-Fehler – auch fehlende/ungültige Supabase-
    // Konfiguration oder eine Ausnahme beim Client-Aufbau – wird wie „nicht
    // eingeloggt" behandelt. So entsteht niemals offener Zugriff auf /admin
    // oder /dashboard (kein 500, kein Durchlassen).
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return loginRedirect();
    }

    let response = NextResponse.next({ request });
    let user = null;
    try {
      const supabase = createServerClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
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
      const result = await supabase.auth.getUser();
      user = result.data.user;
    } catch {
      return loginRedirect();
    }

    if (!user) {
      return loginRedirect();
    }

    return response;
  }

  // 3. Alle anderen (öffentlichen) Pfade: next-intl Locale-Routing
  //    - / → redirect zu /en (Default-Locale, keine Sprach-Detection)
  //    - /en, /de etc. → Locale-Header setzen und durchlassen
  //    - /pricing → redirect zu /en/pricing (bestehende /de/…-URLs bleiben direkt erreichbar)
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
     * - Dateien mit Extension (.png, .jpg, .svg, .ico …, .txt, .md → public/llms.txt, public/ai-summary.md)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|txt|md)).*)",
  ],
};

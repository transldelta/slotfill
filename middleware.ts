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

  // 1a. Public Language Gate (EN/FR/ES only) ───────────────────────────────────
  //     Öffentliche Produktsprachen sind ausschließlich EN/FR/ES. Alle anderen
  //     Locale-Routen (/de, /ar, /hi, /bn, /ru, /zh, /pt …) werden per 308 auf die
  //     englische Variante des gleichen Pfads geleitet — kein deutsches/halb-
  //     übersetztes Produkt öffentlich. Kein Loop: Ziel ist immer /en/...
  const PRODUCT_LOCALES = new Set(["en", "fr", "es"]);
  const seg0 = pathname.replace(/^\/+/, "").split("/");
  if (
    (routing.locales as readonly string[]).includes(seg0[0]) &&
    !PRODUCT_LOCALES.has(seg0[0])
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/en" + pathname.slice(seg0[0].length + 1);
    return NextResponse.redirect(url, { status: 308 });
  }

  // 1b. Freeze alter öffentlicher Routen nach dem Visibility-Pivot ─────────────
  //     Alte Wartelisten-/Booking-/Launch-/Pricing-/Blog-Routen werden per 308
  //     auf passende Pivot-Routen umgeleitet. Keine Admin-/Dashboard-/Auth-/API-
  //     Pfade betroffen (oben bereits ausgenommen). Keine Redirect-Loops:
  //     Ziel ist immer eine Pivot-Route, die selbst nicht eingefroren ist.
  const FROZEN: Record<string, string> = {
    pricing: "/for-clinics",
    launch: "",
    "public-launch": "",
    share: "",
    "termin-buchen": "/clinic-contact",
    kontakt: "/clinic-contact",
    blog: "",
    // Medical-tourism-Reste des Visibility-Pivots → Home (Scheduling OS).
    treatments: "",
    destinations: "",
  };
  const seg = pathname.replace(/^\/+/, "").split("/");
  const locs = routing.locales as readonly string[];
  let frozenLocale: string | null = null;
  let frozenKey: string | null = null;
  if (locs.includes(seg[0]) && seg[1] && Object.prototype.hasOwnProperty.call(FROZEN, seg[1])) {
    frozenLocale = seg[0];
    frozenKey = seg[1];
  } else if (Object.prototype.hasOwnProperty.call(FROZEN, seg[0])) {
    frozenLocale = routing.defaultLocale;
    frozenKey = seg[0];
  }
  if (frozenLocale && frozenKey) {
    const url = request.nextUrl.clone();
    url.pathname = `/${frozenLocale}${FROZEN[frozenKey]}`;
    url.search = "";
    return NextResponse.redirect(url, { status: 308 });
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

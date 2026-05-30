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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. API- und Auth-Routen: direkt durchlassen, keine Änderung
  if (PASSTHROUGH.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. /admin und /dashboard: Supabase-Auth-Check (Login-Pflicht)
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

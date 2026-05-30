import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { detectLocaleFromAcceptLanguage } from "@/lib/detect-locale";
import { locales } from "@/i18n/routing";

// ── i18n: Pfade, die NICHT umgeleitet werden ──────────────────────────────────
const PRIVATE_PREFIXES = ["/admin", "/dashboard", "/api", "/auth"];
const SKIP_PREFIXES = ["/_next", "/favicon", "/robots", "/sitemap"];

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}

function isSkipPath(pathname: string): boolean {
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // Statische Dateien mit Extension überspringen (z.B. .ico, .png, .xml)
  if (/\.[a-z]+$/i.test(pathname)) return true;
  return false;
}

function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
}

// ── Auth-Middleware (unverändert) ─────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // i18n: Öffentliche Pfade auf lokalisierte Version umleiten
  if (!isPrivatePath(pathname) && !isSkipPath(pathname) && !hasLocalePrefix(pathname)) {
    const locale = detectLocaleFromAcceptLanguage(
      request.headers.get("accept-language"),
    );
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Auth-Schutz für /dashboard und /admin (bestehende Logik, unverändert)
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

  // Kein eingeloggter Benutzer -> zur Anmeldeseite umleiten.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}

// Schützt Pfade unter /dashboard und /admin (Login-Pflicht).
// Die eigentliche Admin-Berechtigung wird serverseitig im Admin-Layout geprüft.
// i18n-Pfade sind öffentlich und brauchen keinen Auth-Schutz hier.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

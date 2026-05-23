import {
  createServerClient as createSSRServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Service-Role-Client: voller Datenbank-Zugriff (umgeht RLS).
// NUR serverseitig verwenden, niemals an den Browser ausliefern.
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Server-Client mit Cookie-Zugriff: erkennt den eingeloggten Benutzer.
// Für Server-Komponenten und Server-Actions.
export function createServerClient() {
  const cookieStore = cookies();

  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // In reinen Server-Komponenten ist das Setzen von Cookies nicht
          // erlaubt – das ist ok, die Middleware aktualisiert die Session.
        }
      },
    },
  });
}

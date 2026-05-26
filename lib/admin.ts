import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";

export type AdminContext = {
  user: User;
  admin: SupabaseClient;
};

// Strikt serverseitige Admin-Prüfung. Wirft "NOT_AUTHENTICATED" bzw.
// "NOT_ADMIN". Admin ist, wessen E-Mail in ADMIN_EMAILS steht ODER wessen
// Praxis is_admin = true hat. Der Status kommt nie vom Client.
//
// Für DB-Abfragen wird der Service-Role-Client genutzt (umgeht RLS).
function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const admin = createClient();

  // 1. Admin per ADMIN_EMAILS (kein manuelles Setzen in der DB nötig).
  if (isAdminEmail(user.email)) {
    return { user, admin };
  }

  // 2. Fallback: practices.is_admin.
  const { data: practice } = await admin
    .from("practices")
    .select("is_admin")
    .eq("auth_uid", user.id)
    .maybeSingle();

  if (!practice?.is_admin) throw new Error("NOT_ADMIN");
  return { user, admin };
}

// Bequemer Wrapper für API-Routen: liefert den Kontext oder null.
export async function getAdminContext(): Promise<AdminContext | null> {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

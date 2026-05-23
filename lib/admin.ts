import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";

export type AdminContext = {
  user: User;
  admin: SupabaseClient;
};

// Strikt serverseitige Admin-Prüfung. Wirft "NOT_AUTHENTICATED" bzw.
// "NOT_ADMIN". Der Admin-Status kommt ausschließlich aus der Datenbank
// (practices.is_admin) und niemals vom Client.
//
// Für die is_admin-Abfrage wird der Service-Role-Client genutzt (umgeht RLS).
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");

  const admin = createClient();
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

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";

export type PracticeContext = {
  userId: string;
  practiceId: string;
  practiceName: string;
  admin: SupabaseClient;
};

// Ermittelt die Praxis des aktuell eingeloggten Benutzers.
// Gibt null zurück, wenn niemand angemeldet ist oder keine Praxis existiert.
// Der zurückgegebene admin-Client umgeht RLS – deshalb IMMER zusätzlich
// nach practiceId filtern, damit nur eigene Daten gelesen/geschrieben werden.
export async function getCurrentPractice(): Promise<PracticeContext | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createClient();
  const { data: practice } = await admin
    .from("practices")
    .select("id, name")
    .eq("auth_uid", user.id)
    .single();
  if (!practice) return null;

  return {
    userId: user.id,
    practiceId: practice.id,
    practiceName: practice.name,
    admin,
  };
}

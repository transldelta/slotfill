import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";

export type PracticeContext = {
  userId: string;
  practiceId: string;
  practiceName: string;
  admin: SupabaseClient;
};

// Ermittelt die Praxis des aktuell eingeloggten Benutzers.
// Gibt null zurück, wenn niemand angemeldet ist.
//
// Self-Healing: Existiert für den eingeloggten User noch keine Praxis,
// wird automatisch eine angelegt – so kann das System auch dann Daten
// speichern, wenn beim Registrieren etwas schiefgelaufen ist.
//
// Für Datenbankoperationen wird der Service-Role-Client (admin) genutzt
// (umgeht RLS). Deshalb IMMER zusätzlich nach practiceId filtern, damit
// nur Daten der eigenen Praxis gelesen/geschrieben werden.
export async function getCurrentPractice(): Promise<PracticeContext | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createClient();

  const { data: existing } = await admin
    .from("practices")
    .select("id, name")
    .eq("auth_uid", user.id)
    .maybeSingle();

  let practice = existing;

  if (!practice) {
    const fallbackName = user.email ? user.email.split("@")[0] : "Meine Praxis";
    const { data: created, error } = await admin
      .from("practices")
      .insert({
        auth_uid: user.id,
        name: fallbackName,
        email: user.email ?? null,
      })
      .select("id, name")
      .single();

    if (error || !created) {
      console.error(
        "[getCurrentPractice] Praxis konnte nicht automatisch angelegt werden:",
        error,
      );
      return null;
    }
    practice = created;
  }

  return {
    userId: user.id,
    practiceId: practice.id,
    practiceName: practice.name,
    admin,
  };
}

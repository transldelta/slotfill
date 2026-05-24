import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";
import { ensureOnboarding } from "@/lib/onboarding";

export type PracticeContext = {
  userId: string;
  practiceId: string;
  practiceName: string;
  admin: SupabaseClient;
};

// Ermittelt die Praxis des aktuell eingeloggten Benutzers.
// Gibt null zurück, wenn niemand angemeldet ist oder keine Praxis gefunden
// bzw. angelegt werden konnte.
//
// Existiert noch keine Praxis (z. B. weil das Onboarding nach der
// E-Mail-Bestätigung noch nicht lief), wird sie hier self-healing angelegt
// (idempotent über ensureOnboarding). Datenbankzugriffe laufen über den
// Service-Role-Client; die practice_id kommt nie vom Client.
export async function getCurrentPractice(): Promise<PracticeContext | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const admin = createClient();
  const practice = await ensureOnboarding(admin, user);
  if (!practice) {
    console.error("[getCurrentPractice] Keine Praxis verfügbar für:", user.id);
    return null;
  }

  return {
    userId: user.id,
    practiceId: practice.id,
    practiceName: practice.name,
    admin,
  };
}

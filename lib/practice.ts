import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServerClient } from "@/lib/supabase";

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
// Die Suche erfolgt AUSSCHLIESSLICH über practices.auth_uid = user.id.
// Es wird niemals über E-Mail oder eine vom Client gelieferte practice_id
// gesucht. Datenbankzugriffe laufen über den Service-Role-Client (admin),
// der RLS umgeht; trotzdem wird überall zusätzlich nach practiceId gefiltert.
export async function getCurrentPractice(): Promise<PracticeContext | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[getCurrentPractice] Kein eingeloggter Benutzer (Session fehlt).");
    return null;
  }

  const admin = createClient();

  // Exakte Suche über auth_uid. Wir nutzen bewusst kein .single()/.maybeSingle(),
  // damit auch versehentlich doppelte Datensätze nicht zu einem Fehler führen –
  // dann wird einfach der älteste Eintrag verwendet.
  const { data: practices, error: lookupError } = await admin
    .from("practices")
    .select("id, name")
    .eq("auth_uid", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const practice = practices?.[0] ?? null;

  if (lookupError) {
    console.error("[getCurrentPractice] Fehler bei der Praxis-Suche:", {
      userId: user.id,
      userEmail: user.email,
      lookupError,
      foundPractice: null,
    });
    return null;
  }

  if (practice) {
    return {
      userId: user.id,
      practiceId: practice.id,
      practiceName: practice.name,
      admin,
    };
  }

  // Kein Datensatz gefunden: Diagnose protokollieren und versuchen,
  // self-healing eine Praxis anzulegen.
  console.error("[getCurrentPractice] Keine Praxis gefunden – lege automatisch eine an:", {
    userId: user.id,
    userEmail: user.email,
    lookupError: null,
    foundPractice: null,
  });

  const fallbackName = user.email ? user.email.split("@")[0] : "Meine Praxis";
  const { data: created, error: insertError } = await admin
    .from("practices")
    .insert({
      auth_uid: user.id,
      name: fallbackName,
      email: user.email ?? null,
    })
    .select("id, name")
    .single();

  if (insertError || !created) {
    // 23505 = unique_violation: Es existiert bereits eine Praxis mit dieser
    // auth_uid, sie konnte aber oben nicht gelesen werden. Das deutet stark
    // auf einen falschen/fehlenden SUPABASE_SERVICE_ROLE_KEY hin (dann greift
    // RLS und der SELECT liefert leer).
    if (insertError?.code === "23505") {
      console.error(
        "[getCurrentPractice] Praxis existiert bereits, konnte aber nicht gelesen werden. " +
          "Bitte SUPABASE_SERVICE_ROLE_KEY prüfen (Service-Role nötig, da RLS aktiv).",
        { userId: user.id, userEmail: user.email, insertError },
      );
      // Letzter Versuch, die bestehende Praxis doch noch zu lesen.
      const { data: retry } = await admin
        .from("practices")
        .select("id, name")
        .eq("auth_uid", user.id)
        .order("created_at", { ascending: true })
        .limit(1);
      const retryPractice = retry?.[0];
      if (retryPractice) {
        return {
          userId: user.id,
          practiceId: retryPractice.id,
          practiceName: retryPractice.name,
          admin,
        };
      }
    } else {
      console.error("[getCurrentPractice] Praxis konnte nicht angelegt werden:", {
        userId: user.id,
        userEmail: user.email,
        insertError,
      });
    }
    return null;
  }

  return {
    userId: user.id,
    practiceId: created.id,
    practiceName: created.name,
    admin,
  };
}

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export type PatientDTO = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  onWaitlist: boolean;
};

type PatientColumns = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  notes?: string | null;
};

export function toPatientName(
  first: string | null,
  last: string | null,
): string {
  return [first, last].filter(Boolean).join(" ").trim();
}

// Erkennt, ob ein Supabase-Fehler von einer fehlenden Spalte stammt
// (z. B. weil Migration 003 mit "notes" noch nicht eingespielt wurde).
function isMissingColumn(error: PostgrestError, column: string): boolean {
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" || // PostgreSQL: undefined_column
    error.code === "PGRST204" || // PostgREST: Spalte nicht im Schema-Cache
    (message.includes(column) &&
      (message.includes("column") || message.includes("schema cache")))
  );
}

// Legt einen Patienten an. Falls die Spalte "notes" in der Datenbank noch
// nicht existiert, wird der Insert ohne "notes" wiederholt, damit das
// Speichern trotzdem funktioniert (self-healing gegen fehlende Migration).
export async function insertPatient(
  admin: SupabaseClient,
  practiceId: string,
  input: { name: string; phone: string; notes?: string | null },
): Promise<{ patient?: PatientDTO; error?: PostgrestError }> {
  const base = {
    practice_id: practiceId,
    first_name: input.name,
    last_name: "",
    phone: input.phone,
  };

  let result = await admin
    .from("patients")
    .insert({ ...base, notes: input.notes || null })
    .select("id, first_name, last_name, phone, notes")
    .single<PatientColumns>();

  if (result.error && isMissingColumn(result.error, "notes")) {
    console.error(
      "[insertPatient] Spalte 'notes' fehlt – vermutlich wurde Migration 003 nicht eingespielt. Lege Patient ohne Notiz an.",
      result.error,
    );
    result = await admin
      .from("patients")
      .insert(base)
      .select("id, first_name, last_name, phone")
      .single<PatientColumns>();
  }

  if (result.error || !result.data) {
    return { error: result.error ?? undefined };
  }

  const row = result.data;
  return {
    patient: {
      id: row.id,
      name: toPatientName(row.first_name, row.last_name),
      phone: row.phone,
      notes: row.notes ?? null,
      onWaitlist: false,
    },
  };
}

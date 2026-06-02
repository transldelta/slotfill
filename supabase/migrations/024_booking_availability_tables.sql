-- =============================================================
-- SlotFill – Migration 024: Fehlende Buchungs-Tabellen
-- =============================================================
-- Legt die beiden Tabellen an, die für Öffnungszeiten und
-- gesperrte Zeiten benötigt werden und in einigen Umgebungen
-- noch fehlen.
--
-- IDEMPOTENT: Kann mehrfach ohne Fehler ausgeführt werden.
--   → CREATE TABLE IF NOT EXISTS
--   → CREATE INDEX IF NOT EXISTS
--   → DROP POLICY IF EXISTS  vor jedem CREATE POLICY
--   → ALTER TABLE ENABLE ROW LEVEL SECURITY ist idempotent
--
-- Fehlende Tabellen (laut Supabase-Prüfung):
--   public.booking_availability_rules   (Öffnungszeiten je Wochentag)
--   public.booking_blocked_times        (gesperrte Zeiträume)
--
-- Voraussetzungen (müssen bereits existieren):
--   public.practices  mit Spalte id UUID PRIMARY KEY
--   (aus Migration 001 / 023)
--
-- Auth-Muster (wie in Migrations 016–018 / 023 etabliert):
--   practice_id IN (
--     SELECT id FROM public.practices WHERE auth_uid = auth.uid()
--   )
--   service_role: Vollzugriff (USING true / WITH CHECK true)
-- =============================================================


-- ==============================================================
-- ABSCHNITT 1: booking_availability_rules
-- ==============================================================
--
-- Speichert Öffnungszeiten je Praxis und Wochentag.
--   weekday:        1 = Montag … 7 = Sonntag (ISO 8601)
--   start_time:     Beginn des Zeitfenster-Blocks
--   end_time:       Ende  des Zeitfenster-Blocks
--   slot_minutes:   Länge eines einzelnen Slots in Minuten
--   buffer_minutes: Pause zwischen zwei Slots (Reinigung, Puffer)
--   is_active:      Regel deaktivierbar ohne DELETE
--

CREATE TABLE IF NOT EXISTS public.booking_availability_rules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID        NOT NULL
                               REFERENCES public.practices(id) ON DELETE CASCADE,
  -- ISO 8601: 1 = Montag, 2 = Dienstag, … 7 = Sonntag
  weekday        SMALLINT    NOT NULL
                               CHECK (weekday BETWEEN 1 AND 7),
  start_time     TIME        NOT NULL,
  end_time       TIME        NOT NULL,
  -- Erlaubte Slot-Längen in Minuten
  slot_minutes   SMALLINT    NOT NULL DEFAULT 30
                               CHECK (slot_minutes IN (15, 20, 30, 45, 60)),
  -- Pufferzeit ≥ 0 Minuten
  buffer_minutes SMALLINT    NOT NULL DEFAULT 0
                               CHECK (buffer_minutes >= 0),
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Zeitbereich muss vorwärts zeigen
  CONSTRAINT booking_availability_rules_time_range_check
    CHECK (end_time > start_time)
);

-- ── Indizes ────────────────────────────────────────────────────
-- Wird bei jeder Slot-Generierung (Auto-Confirm + öffentliche API)
-- gefiltert nach practice_id, weekday und is_active.

CREATE INDEX IF NOT EXISTS idx_booking_availability_practice
  ON public.booking_availability_rules (practice_id);

CREATE INDEX IF NOT EXISTS idx_booking_availability_weekday
  ON public.booking_availability_rules (weekday);

-- Zusammengesetzter Index für den häufigen Suchpfad:
--   WHERE practice_id = $1 AND weekday = $2 AND is_active = true
CREATE INDEX IF NOT EXISTS idx_booking_availability_active
  ON public.booking_availability_rules (practice_id, weekday)
  WHERE is_active = true;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.booking_availability_rules ENABLE ROW LEVEL SECURITY;

-- Praxis: eigene Regeln lesen
DROP POLICY IF EXISTS "Tenant can read own availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Tenant can read own availability rules"
  ON public.booking_availability_rules FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Regeln anlegen
DROP POLICY IF EXISTS "Tenant can insert own availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Tenant can insert own availability rules"
  ON public.booking_availability_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Regeln aktualisieren
DROP POLICY IF EXISTS "Tenant can update own availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Tenant can update own availability rules"
  ON public.booking_availability_rules FOR UPDATE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  )
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Regeln löschen
DROP POLICY IF EXISTS "Tenant can delete own availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Tenant can delete own availability rules"
  ON public.booking_availability_rules FOR DELETE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Service-Role: Vollzugriff
--   Wird benötigt für Admin-Buchungseinstellungen + Auto-Confirm-Logik
DROP POLICY IF EXISTS "Service role can manage availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Service role can manage availability rules"
  ON public.booking_availability_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_availability_rules
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_availability_rules
  TO service_role;


-- ==============================================================
-- ABSCHNITT 2: booking_blocked_times
-- ==============================================================
--
-- Speichert blockierte Zeiträume (Urlaub, Feiertage, Pausen …).
--   blocked_date:  das gesperrte Datum
--   start_time IS NULL → ganzer Tag gesperrt
--   end_time   IS NULL → ab start_time bis Tagesende gesperrt
--   reason:        Freitext (z. B. "Urlaub", "Feiertag")
--
-- Auto-Confirm prüft diese Tabelle vor jeder Bestätigung.
--

CREATE TABLE IF NOT EXISTS public.booking_blocked_times (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID        NOT NULL
                               REFERENCES public.practices(id) ON DELETE CASCADE,
  blocked_date   DATE        NOT NULL,
  -- NULL = ganzer Tag gesperrt
  start_time     TIME,
  -- NULL = bis Tagesende; wenn gesetzt: muss nach start_time liegen
  end_time       TIME,
  reason         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Zeitbereichs-Konsistenz:
  --   Beide NULL      → ganzer Tag gesperrt          ✓
  --   Nur start NULL  → ungültig, aber akzeptiert
  --   Beide gesetzt   → end_time muss > start_time   ✓
  CONSTRAINT booking_blocked_times_range_valid
    CHECK (
      start_time IS NULL
      OR end_time IS NULL
      OR end_time > start_time
    )
);

-- ── Indizes ────────────────────────────────────────────────────
-- Auto-Confirm filtert täglich nach practice_id + blocked_date.

CREATE INDEX IF NOT EXISTS idx_booking_blocked_practice
  ON public.booking_blocked_times (practice_id);

CREATE INDEX IF NOT EXISTS idx_booking_blocked_date
  ON public.booking_blocked_times (blocked_date);

-- Zusammengesetzter Index für den primären Query-Pfad:
--   WHERE practice_id = $1 AND blocked_date = $2
CREATE INDEX IF NOT EXISTS idx_booking_blocked_practice_date
  ON public.booking_blocked_times (practice_id, blocked_date);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.booking_blocked_times ENABLE ROW LEVEL SECURITY;

-- Praxis: eigene Sperren lesen
DROP POLICY IF EXISTS "Tenant can read own blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Tenant can read own blocked times"
  ON public.booking_blocked_times FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Sperren anlegen
DROP POLICY IF EXISTS "Tenant can insert own blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Tenant can insert own blocked times"
  ON public.booking_blocked_times FOR INSERT
  TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Sperren aktualisieren
DROP POLICY IF EXISTS "Tenant can update own blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Tenant can update own blocked times"
  ON public.booking_blocked_times FOR UPDATE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  )
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis: eigene Sperren löschen
DROP POLICY IF EXISTS "Tenant can delete own blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Tenant can delete own blocked times"
  ON public.booking_blocked_times FOR DELETE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Service-Role: Vollzugriff
--   Wird benötigt für Admin-API + Auto-Confirm-Prüfung gesperrter Zeiten
DROP POLICY IF EXISTS "Service role can manage blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Service role can manage blocked times"
  ON public.booking_blocked_times FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── Grants ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_blocked_times
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_blocked_times
  TO service_role;


-- ==============================================================
-- ABSCHNITT 3: Schema-Grants sicherstellen
-- ==============================================================
-- service_role braucht USAGE auf public, damit alle obigen
-- Grants wirksam sind (idempotent – doppelter GRANT ist kein Fehler).

GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

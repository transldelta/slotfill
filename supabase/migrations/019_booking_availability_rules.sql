-- =============================================================
-- SlotFill – Migration 019: booking_availability_rules
-- =============================================================
-- Definiert Öffnungszeiten und Zeitfenster einer Praxis.
--
-- Sicherheitsregeln:
--   - Nur die eigene Praxis darf eigene Regeln lesen/schreiben
--   - Service-Role: Vollzugriff (Admin-API)
--   - is_active DEFAULT true – zum Deaktivieren einzelner Tage
--   - slot_minutes: nur erlaubte Werte (15/20/30/45/60)
--   - buffer_minutes: min. 0 Minuten
-- =============================================================

CREATE TABLE IF NOT EXISTS public.booking_availability_rules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID        NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  -- Wochentag: 1=Montag ... 7=Sonntag (ISO 8601)
  weekday        SMALLINT    NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  start_time     TIME        NOT NULL,
  end_time       TIME        NOT NULL CHECK (end_time > start_time),
  -- Slot-Länge in Minuten
  slot_minutes   SMALLINT    NOT NULL DEFAULT 30
                             CHECK (slot_minutes IN (15, 20, 30, 45, 60)),
  -- Pufferzeit zwischen Terminen (Reinigung, Übergabe)
  buffer_minutes SMALLINT    NOT NULL DEFAULT 0 CHECK (buffer_minutes >= 0),
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_availability_practice
  ON public.booking_availability_rules(practice_id);
CREATE INDEX IF NOT EXISTS idx_booking_availability_weekday
  ON public.booking_availability_rules(weekday);

ALTER TABLE public.booking_availability_rules ENABLE ROW LEVEL SECURITY;

-- Praxis darf nur eigene Regeln lesen
DROP POLICY IF EXISTS "Tenant can read own availability rules" ON public.booking_availability_rules;
CREATE POLICY "Tenant can read own availability rules"
  ON public.booking_availability_rules FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Regeln anlegen
DROP POLICY IF EXISTS "Tenant can insert own availability rules" ON public.booking_availability_rules;
CREATE POLICY "Tenant can insert own availability rules"
  ON public.booking_availability_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Regeln aktualisieren
DROP POLICY IF EXISTS "Tenant can update own availability rules" ON public.booking_availability_rules;
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

-- Praxis darf eigene Regeln löschen
DROP POLICY IF EXISTS "Tenant can delete own availability rules" ON public.booking_availability_rules;
CREATE POLICY "Tenant can delete own availability rules"
  ON public.booking_availability_rules FOR DELETE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Service-Role: Vollzugriff
DROP POLICY IF EXISTS "Service role can manage availability rules" ON public.booking_availability_rules;
CREATE POLICY "Service role can manage availability rules"
  ON public.booking_availability_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.booking_availability_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.booking_availability_rules TO service_role;

-- =============================================================
-- SlotFill – Migration 020: booking_blocked_times
-- =============================================================
-- Gesperrte Zeiten einer Praxis (Urlaub, Feiertage, Pausen).
--
-- Sicherheitsregeln:
--   - Nur die eigene Praxis darf eigene Sperren lesen/schreiben
--   - start_time NULL = ganzer Tag gesperrt
--   - end_time CHECK: wenn gesetzt, muss end_time > start_time sein
--   - Service-Role: Vollzugriff (Admin-API)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.booking_blocked_times (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID        NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  blocked_date   DATE        NOT NULL,
  -- NULL = ganzer Tag gesperrt
  start_time     TIME,
  -- NULL = bis Tagesende gesperrt
  end_time       TIME,
  reason         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT blocked_time_range_valid
    CHECK (
      start_time IS NULL
      OR end_time IS NULL
      OR end_time > start_time
    )
);

CREATE INDEX IF NOT EXISTS idx_booking_blocked_practice
  ON public.booking_blocked_times(practice_id);
CREATE INDEX IF NOT EXISTS idx_booking_blocked_date
  ON public.booking_blocked_times(blocked_date);

ALTER TABLE public.booking_blocked_times ENABLE ROW LEVEL SECURITY;

-- Praxis darf nur eigene gesperrte Zeiten lesen
DROP POLICY IF EXISTS "Tenant can read own blocked times" ON public.booking_blocked_times;
CREATE POLICY "Tenant can read own blocked times"
  ON public.booking_blocked_times FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Sperren anlegen
DROP POLICY IF EXISTS "Tenant can insert own blocked times" ON public.booking_blocked_times;
CREATE POLICY "Tenant can insert own blocked times"
  ON public.booking_blocked_times FOR INSERT
  TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Sperren aktualisieren
DROP POLICY IF EXISTS "Tenant can update own blocked times" ON public.booking_blocked_times;
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

-- Praxis darf eigene Sperren löschen
DROP POLICY IF EXISTS "Tenant can delete own blocked times" ON public.booking_blocked_times;
CREATE POLICY "Tenant can delete own blocked times"
  ON public.booking_blocked_times FOR DELETE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM public.practices WHERE auth_uid = auth.uid()
    )
  );

-- Service-Role: Vollzugriff
DROP POLICY IF EXISTS "Service role can manage blocked times" ON public.booking_blocked_times;
CREATE POLICY "Service role can manage blocked times"
  ON public.booking_blocked_times FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.booking_blocked_times TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.booking_blocked_times TO service_role;

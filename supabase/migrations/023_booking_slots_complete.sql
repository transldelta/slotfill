-- =============================================================
-- SlotFill – Migration 023: Buchungs-Slots & Auto-Confirm
-- =============================================================
-- Vollständige, idempotente Migration für alle fehlenden
-- Tabellen, Spalten, Indizes und RLS-Policies des
-- Terminbuchungs-Systems.
--
-- IDEMPOTENT: Kann mehrfach ohne Fehler ausgeführt werden.
--   → CREATE TABLE IF NOT EXISTS
--   → ALTER TABLE ... ADD COLUMN IF NOT EXISTS
--   → CREATE INDEX IF NOT EXISTS
--   → DROP POLICY IF EXISTS  vor jedem CREATE POLICY
--   → DO $$ ... END $$ für bedingte Constraint-Änderungen
--
-- Fehlende Strukturen (laut Supabase-Prüfung):
--   Tabellen     : booking_availability_rules
--                  booking_blocked_times
--   practices    : auto_confirm_bookings, booking_slot_minutes,
--                  booking_buffer_minutes
--   booking_req. : requested_date, requested_time,
--                  confirmed_date, confirmed_time,
--                  confirmation_mode, email_status,
--                  email_sent_at, archived_at
--
-- Auth-Muster (wie in Migrations 016–018 etabliert):
--   tenant_id / practice_id IN (
--     SELECT id FROM public.practices WHERE auth_uid = auth.uid()
--   )
--   service_role: Vollzugriff (USING true / WITH CHECK true)
-- =============================================================


-- ==============================================================
-- ABSCHNITT 1: practices – Buchungseinstellungen ergänzen
-- ==============================================================
--
-- auto_confirm_bookings DEFAULT false → kein Auto-Confirm ohne
-- bewusste Aktivierung. Hinweis in Admin-UI obligatorisch.
--

ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS auto_confirm_bookings  BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_slot_minutes   SMALLINT NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS booking_buffer_minutes SMALLINT NOT NULL DEFAULT 0;

-- CHECK: booking_slot_minutes muss erlaubter Wert sein (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.practices'::regclass
      AND conname   = 'practices_booking_slot_minutes_check'
  ) THEN
    ALTER TABLE public.practices
      ADD CONSTRAINT practices_booking_slot_minutes_check
      CHECK (booking_slot_minutes IN (15, 20, 30, 45, 60));
  END IF;
END $$;

-- CHECK: booking_buffer_minutes ≥ 0 (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.practices'::regclass
      AND conname   = 'practices_booking_buffer_minutes_check'
  ) THEN
    ALTER TABLE public.practices
      ADD CONSTRAINT practices_booking_buffer_minutes_check
      CHECK (booking_buffer_minutes >= 0);
  END IF;
END $$;


-- ==============================================================
-- ABSCHNITT 2: booking_requests – Neue Spalten ergänzen
-- ==============================================================

ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS requested_date    DATE,
  ADD COLUMN IF NOT EXISTS requested_time    TIME,
  ADD COLUMN IF NOT EXISTS confirmed_date    DATE,
  ADD COLUMN IF NOT EXISTS confirmed_time    TIME,
  ADD COLUMN IF NOT EXISTS confirmation_mode TEXT        NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS email_status      TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at       TIMESTAMPTZ;

-- ------------------------------------------------------------
-- 2a. confirmation_mode CHECK (idempotent)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.booking_requests'::regclass
      AND conname   = 'booking_requests_confirmation_mode_check'
  ) THEN
    ALTER TABLE public.booking_requests
      ADD CONSTRAINT booking_requests_confirmation_mode_check
      CHECK (confirmation_mode IN ('manual', 'auto'));
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2b. status CHECK: 'archived' hinzufügen (idempotent)
--
-- Vorgehen:
--  1. Prüfe ob 'archived' bereits in irgendeinem status-Constraint
--     der Tabelle enthalten ist.
--  2. Falls nicht: alten CHECK-Constraint droppen (auto-generierter
--     Name aus Migration 018: booking_requests_status_check),
--     neuen Constraint mit vollständiger Liste anlegen.
-- ------------------------------------------------------------
DO $$
BEGIN
  -- Ist 'archived' schon in einem CHECK-Constraint dieser Tabelle?
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'public.booking_requests'::regclass
      AND  contype  = 'c'
      AND  pg_get_constraintdef(oid) LIKE '%archived%'
  ) THEN
    -- Alten Status-Constraint entfernen (falls vorhanden)
    ALTER TABLE public.booking_requests
      DROP CONSTRAINT IF EXISTS booking_requests_status_check;

    -- Neuen Constraint mit 'archived' anlegen
    ALTER TABLE public.booking_requests
      ADD CONSTRAINT booking_requests_status_check
      CHECK (status IN (
        'booking_request',
        'pending_confirmation',
        'confirmed',
        'declined',
        'cancelled',
        'archived'
      ));
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2c. Indizes für neue Spalten
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_booking_requests_archived_at
  ON public.booking_requests (archived_at)
  WHERE archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_requests_requested_date
  ON public.booking_requests (requested_date)
  WHERE requested_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_requests_confirmed_date
  ON public.booking_requests (confirmed_date)
  WHERE confirmed_date IS NOT NULL;

-- ------------------------------------------------------------
-- 2d. anon INSERT-Policy aktualisieren: confirmation_mode = 'manual'
--     erzwingen (Defense-in-Depth – App nutzt service_role,
--     aber direkte Inserts bleiben sicher)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Anon can insert booking request"
  ON public.booking_requests;
CREATE POLICY "Anon can insert booking request"
  ON public.booking_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    privacy_accepted    = true
    AND auto_confirmed  = false
    AND confirmation_mode = 'manual'
  );


-- ==============================================================
-- ABSCHNITT 3: booking_availability_rules
-- ==============================================================
--
-- Speichert Öffnungszeiten je Praxis und Wochentag.
--   weekday: 1 = Montag … 7 = Sonntag (ISO 8601)
--   slot_minutes: Länge eines Zeitfensters in Minuten
--   buffer_minutes: Pause zwischen zwei Terminen
--   is_active: Regel ohne DELETE deaktivierbar
--

CREATE TABLE IF NOT EXISTS public.booking_availability_rules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id    UUID        NOT NULL
                               REFERENCES public.practices(id) ON DELETE CASCADE,
  -- Wochentag ISO 8601: 1 = Montag, 7 = Sonntag
  weekday        SMALLINT    NOT NULL
                               CHECK (weekday BETWEEN 1 AND 7),
  start_time     TIME        NOT NULL,
  end_time       TIME        NOT NULL,
  -- Erlaubte Slot-Längen
  slot_minutes   SMALLINT    NOT NULL DEFAULT 30
                               CHECK (slot_minutes IN (15, 20, 30, 45, 60)),
  -- Pufferzeit (Reinigung, Übergabe)
  buffer_minutes SMALLINT    NOT NULL DEFAULT 0
                               CHECK (buffer_minutes >= 0),
  is_active      BOOLEAN     NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT booking_availability_rules_time_range_check
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_booking_availability_practice
  ON public.booking_availability_rules (practice_id);

CREATE INDEX IF NOT EXISTS idx_booking_availability_weekday
  ON public.booking_availability_rules (weekday);

CREATE INDEX IF NOT EXISTS idx_booking_availability_active
  ON public.booking_availability_rules (practice_id, weekday)
  WHERE is_active = true;

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

-- Service-Role: Vollzugriff (Admin-API + Auto-Confirm-Logik)
DROP POLICY IF EXISTS "Service role can manage availability rules"
  ON public.booking_availability_rules;
CREATE POLICY "Service role can manage availability rules"
  ON public.booking_availability_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_availability_rules
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_availability_rules
  TO service_role;


-- ==============================================================
-- ABSCHNITT 4: booking_blocked_times
-- ==============================================================
--
-- Speichert blockierte Zeiten (Urlaub, Feiertage, Pausen).
--   blocked_date: das gesperrte Datum
--   start_time NULL → ganzer Tag gesperrt
--   end_time   NULL → bis Tagesende gesperrt
--   reason: freitext (z. B. "Urlaub", "Feiertag", "Teamschulung")
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

  -- Zeitbereichs-Konsistenz: wenn beide gesetzt → end_time > start_time
  CONSTRAINT booking_blocked_times_range_valid
    CHECK (
      start_time IS NULL
      OR end_time IS NULL
      OR end_time > start_time
    )
);

CREATE INDEX IF NOT EXISTS idx_booking_blocked_practice
  ON public.booking_blocked_times (practice_id);

CREATE INDEX IF NOT EXISTS idx_booking_blocked_date
  ON public.booking_blocked_times (blocked_date);

-- Zusammengesetzter Index für den häufigen Query-Pfad
CREATE INDEX IF NOT EXISTS idx_booking_blocked_practice_date
  ON public.booking_blocked_times (practice_id, blocked_date);

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

-- Service-Role: Vollzugriff (Admin-API + Auto-Confirm-Logik)
DROP POLICY IF EXISTS "Service role can manage blocked times"
  ON public.booking_blocked_times;
CREATE POLICY "Service role can manage blocked times"
  ON public.booking_blocked_times FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_blocked_times
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.booking_blocked_times
  TO service_role;


-- ==============================================================
-- ABSCHNITT 5: service_role Grants sicherstellen
-- ==============================================================
--
-- Stellt sicher, dass service_role auf alle neuen Strukturen
-- zugreifen kann. Wird gebraucht für:
--   - Admin-API (/api/admin/booking-settings, /api/admin/booking-requests)
--   - Auto-Confirm-Logik (lib/booking-slots.ts via service_role Client)
--   - öffentliche Slot-API (/api/booking-slots via service_role Client)
--

GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

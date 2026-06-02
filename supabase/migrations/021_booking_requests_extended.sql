-- =============================================================
-- SlotFill – Migration 021: booking_requests – Erweiterung
-- =============================================================
-- Erweitert booking_requests um:
--   - requested_date / requested_time (Patienten-Wunsch)
--   - confirmed_date / confirmed_time  (Admin-bestätigter Termin)
--   - confirmation_mode                (manual | auto)
--   - email_status / email_sent_at     (E-Mail-Tracking)
--   - archived_at                      (Soft-Delete für Archivierung)
--   - Status 'archived' zur Status-Liste ergänzt
--
-- Sicherheitsregeln:
--   - confirmed_date/time darf nur via Service-Role gesetzt werden
--   - archived_at ist Soft-Delete: niemals hartes DELETE
--   - confirmation_mode DEFAULT 'manual' – kein Auto-Confirm by default
-- =============================================================

-- ─── Neue Spalten ──────────────────────────────────────────────────────────

ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS requested_date     DATE,
  ADD COLUMN IF NOT EXISTS requested_time     TIME,
  ADD COLUMN IF NOT EXISTS confirmed_date     DATE,
  ADD COLUMN IF NOT EXISTS confirmed_time     TIME,
  ADD COLUMN IF NOT EXISTS confirmation_mode  TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS email_status       TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at        TIMESTAMPTZ;

-- confirmation_mode CHECK (muss 'manual' oder 'auto' sein)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'booking_requests_confirmation_mode_check'
  ) THEN
    ALTER TABLE public.booking_requests
      ADD CONSTRAINT booking_requests_confirmation_mode_check
      CHECK (confirmation_mode IN ('manual', 'auto'));
  END IF;
END $$;

-- ─── Status-Liste erweitern (archived hinzufügen) ──────────────────────────
-- Bestehenden CHECK-Constraint droppen und mit 'archived' neu anlegen

ALTER TABLE public.booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_status_check;

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

-- ─── Index für Archiv ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_booking_requests_archived_at
  ON public.booking_requests(archived_at)
  WHERE archived_at IS NOT NULL;

-- ─── Index für Datum-Suche ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_booking_requests_requested_date
  ON public.booking_requests(requested_date)
  WHERE requested_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_booking_requests_confirmed_date
  ON public.booking_requests(confirmed_date)
  WHERE confirmed_date IS NOT NULL;

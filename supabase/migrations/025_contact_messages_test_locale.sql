-- =============================================================
-- Migration 025: contact_messages – locale + is_test
--               booking_requests  – is_test
-- =============================================================
-- Idempotent: ADD COLUMN IF NOT EXISTS
-- =============================================================

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'de',
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.contact_messages.is_test IS 'true = Testdaten, werden nach Verifizierung gelöscht';
COMMENT ON COLUMN public.booking_requests.is_test   IS 'true = Testdaten, werden nach Verifizierung gelöscht';

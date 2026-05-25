-- =============================================================
-- SlotFill – Migration 012: Benachrichtigungs-Status
-- =============================================================
-- Ergänzt sent_notifications um einen aussagekräftigen Status
-- (prepared, sent, failed, skipped_no_provider, skipped_no_consent,
--  skipped_invalid_phone). delivered bleibt als boolescher Schnellzugriff.
-- =============================================================

ALTER TABLE public.sent_notifications
ADD COLUMN IF NOT EXISTS status TEXT;

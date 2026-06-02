-- =============================================================
-- SlotFill – Migration 022: practices – Buchungseinstellungen
-- =============================================================
-- Ergänzt die practices-Tabelle um praxis-spezifische
-- Buchungseinstellungen.
--
-- Sicherheitsregeln:
--   - auto_confirm_bookings DEFAULT false (sicher)
--   - Nur Service-Role kann auto_confirm_bookings ändern
--   - Hinweis in UI: "Nur aktivieren wenn Verfügbarkeit vollständig gepflegt"
-- =============================================================

ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS auto_confirm_bookings  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_slot_minutes   SMALLINT NOT NULL DEFAULT 30
    CHECK (booking_slot_minutes IN (15, 20, 30, 45, 60)),
  ADD COLUMN IF NOT EXISTS booking_buffer_minutes SMALLINT NOT NULL DEFAULT 0
    CHECK (booking_buffer_minutes >= 0);

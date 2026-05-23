-- =============================================================
-- SlotFill – Migration 003: Patienten-Notizen
-- =============================================================
-- Ergänzt die patients-Tabelle um ein optionales Notiz-Feld,
-- das in der Patienten-Verwaltung verwendet wird.
-- =============================================================

alter table patients
  add column if not exists notes text;

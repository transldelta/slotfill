-- =============================================================
-- SlotFill – Migration 002: Auth & Onboarding
-- =============================================================
-- Ergänzt die bestehenden Tabellen um Felder, die für die
-- Anmeldung (Auth) und das automatische Onboarding nötig sind.
-- =============================================================

-- practices: Verknüpfung mit dem Supabase-Auth-Benutzer und
-- ein automatisch erzeugter Empfehlungs-Code (referral_code).
alter table practices
  add column if not exists auth_uid uuid unique;

alter table practices
  add column if not exists referral_code text unique
    default substr(md5(gen_random_uuid()::text), 1, 8);

create index if not exists idx_practices_auth_uid on practices(auth_uid);

-- subscriptions: Ende der Testphase (Trial).
alter table subscriptions
  add column if not exists trial_ends_at timestamptz;

-- =============================================================
-- SlotFill – Datenbank-Schema (Migration 001)
-- =============================================================
-- Dieses Skript erstellt alle Tabellen, Indizes und aktiviert
-- Row Level Security (RLS). Es ist für Supabase / PostgreSQL.
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- practices: Praxen / Mandanten (Tenants)
-- -------------------------------------------------------------
create table if not exists practices (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  address       text,
  timezone      text not null default 'Europe/Berlin',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- patients: Patienten einer Praxis
-- -------------------------------------------------------------
create table if not exists patients (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  email         text,
  phone         text,
  whatsapp_opt_in boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_patients_practice on patients(practice_id);

-- -------------------------------------------------------------
-- waitlist: Warteliste-Einträge
-- -------------------------------------------------------------
create table if not exists waitlist (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  patient_id    uuid not null references patients(id) on delete cascade,
  priority      integer not null default 0,
  preferred_days text[],
  preferred_times text[],
  notes         text,
  status        text not null default 'active', -- active | paused | removed
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_waitlist_practice on waitlist(practice_id);
create index if not exists idx_waitlist_status on waitlist(status);
create index if not exists idx_waitlist_priority on waitlist(priority desc);

-- -------------------------------------------------------------
-- appointments: Termine (auch frei gewordene Slots)
-- -------------------------------------------------------------
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  patient_id    uuid references patients(id) on delete set null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  status        text not null default 'open', -- open | offered | booked | cancelled
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_appointments_practice on appointments(practice_id);
create index if not exists idx_appointments_status on appointments(status);
create index if not exists idx_appointments_starts_at on appointments(starts_at);

-- -------------------------------------------------------------
-- notification_links: Einmal-Links zum Annehmen eines Slots
-- -------------------------------------------------------------
create table if not exists notification_links (
  id            uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  patient_id    uuid not null references patients(id) on delete cascade,
  token         text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_notification_links_token on notification_links(token);
create index if not exists idx_notification_links_appointment on notification_links(appointment_id);

-- -------------------------------------------------------------
-- plans: Preispläne / Abomodelle
-- -------------------------------------------------------------
create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  stripe_price_id text unique,
  price_cents   integer not null default 0,
  currency      text not null default 'eur',
  interval      text not null default 'month', -- month | year
  features      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- subscriptions: Abos der Praxen
-- -------------------------------------------------------------
create table if not exists subscriptions (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  plan_id       uuid references plans(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status        text not null default 'trialing', -- trialing | active | past_due | canceled
  current_period_end timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_subscriptions_practice on subscriptions(practice_id);

-- -------------------------------------------------------------
-- sent_notifications: Protokoll versendeter Benachrichtigungen
-- -------------------------------------------------------------
create table if not exists sent_notifications (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid not null references practices(id) on delete cascade,
  patient_id    uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  channel       text not null, -- email | sms | whatsapp
  status        text not null default 'sent', -- sent | delivered | failed
  provider_id   text,
  payload       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_sent_notifications_practice on sent_notifications(practice_id);
create index if not exists idx_sent_notifications_channel on sent_notifications(channel);

-- -------------------------------------------------------------
-- error_logs: Fehlerprotokoll
-- -------------------------------------------------------------
create table if not exists error_logs (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid references practices(id) on delete set null,
  context       text,
  message       text not null,
  stack         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_error_logs_created_at on error_logs(created_at desc);

-- -------------------------------------------------------------
-- blog_posts: Blog-Artikel (Marketing)
-- -------------------------------------------------------------
create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  content       text,
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_published on blog_posts(published);

-- -------------------------------------------------------------
-- support_tickets: Support-Anfragen
-- -------------------------------------------------------------
create table if not exists support_tickets (
  id            uuid primary key default gen_random_uuid(),
  practice_id   uuid references practices(id) on delete set null,
  email         text not null,
  subject       text not null,
  message       text not null,
  status        text not null default 'open', -- open | pending | closed
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_support_tickets_status on support_tickets(status);

-- -------------------------------------------------------------
-- referrals: Empfehlungsprogramm
-- -------------------------------------------------------------
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_practice_id uuid not null references practices(id) on delete cascade,
  referred_email text not null,
  code          text not null unique,
  status        text not null default 'pending', -- pending | signed_up | rewarded
  rewarded_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_referrals_referrer on referrals(referrer_practice_id);
create index if not exists idx_referrals_code on referrals(code);

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================
-- HINWEIS: RLS schützt die Daten, sodass jede Praxis nur ihre
-- eigenen Datensätze sieht. Aktiviere RLS und ergänze passende
-- Policies (z. B. auf Basis von auth.uid() bzw. practice_id),
-- sobald die Authentifizierung steht. Beispiel weiter unten.
-- =============================================================

alter table practices          enable row level security;
alter table patients           enable row level security;
alter table waitlist           enable row level security;
alter table appointments       enable row level security;
alter table notification_links enable row level security;
alter table plans              enable row level security;
alter table subscriptions      enable row level security;
alter table sent_notifications enable row level security;
alter table error_logs         enable row level security;
alter table blog_posts         enable row level security;
alter table support_tickets    enable row level security;
alter table referrals          enable row level security;

-- Beispiel-Policy (erst aktivieren, wenn Auth/JWT eingerichtet ist):
-- create policy "practice_isolation" on patients
--   for all
--   using (practice_id = (auth.jwt() ->> 'practice_id')::uuid);

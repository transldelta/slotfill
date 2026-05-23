-- =============================================================
-- SlotFill – Migration 004: Termine & Benachrichtigungen
-- =============================================================
-- Hinweis: Die Tabellen appointments, notification_links und
-- sent_notifications wurden bereits in Migration 001 mit einer
-- ANDEREN Struktur angelegt, aber von keiner Funktion genutzt
-- (sie sind leer). Wir verwerfen sie daher und legen sie mit der
-- für Schritt 4 benötigten Struktur neu an.
-- =============================================================

DROP TABLE IF EXISTS public.sent_notifications CASCADE;
DROP TABLE IF EXISTS public.notification_links CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Tabelle: appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled','filled')),
  filled_by_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: notification_links
CREATE TABLE IF NOT EXISTS public.notification_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_by_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: sent_notifications
CREATE TABLE IF NOT EXISTS public.sent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  notification_link_id UUID REFERENCES public.notification_links(id) ON DELETE SET NULL,
  delivered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für häufige Abfragen
CREATE INDEX IF NOT EXISTS idx_appointments_practice ON public.appointments(practice_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_notification_links_slug ON public.notification_links(slug);
CREATE INDEX IF NOT EXISTS idx_notification_links_appointment ON public.notification_links(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sent_notifications_practice ON public.sent_notifications(practice_id);

-- Row Level Security aktivieren (Zugriff erfolgt serverseitig über service_role)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

-- Grants für service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notification_links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sent_notifications TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

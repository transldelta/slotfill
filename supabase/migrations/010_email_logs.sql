-- =============================================================
-- SlotFill – Migration 010: E-Mail-Logs & Trial-Erinnerung
-- =============================================================

-- E-Mail-Logs mit Idempotenz
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID REFERENCES public.practices(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT false,
  error_message TEXT
);

-- Trial-Erinnerungs-Zeitstempel
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMPTZ;

-- RLS aktivieren
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Nur service_role darf lesen/schreiben
DROP POLICY IF EXISTS "Service role can manage email_logs" ON public.email_logs;

CREATE POLICY "Service role can manage email_logs" ON public.email_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================
-- SlotFill – Migration 015b: Audit-Logs
-- =============================================================
-- Protokoll wichtiger Admin- und Systemaktionen. Keine Secrets,
-- keine Tokens, keine Passwörter speichern.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  actor_user_id UUID,
  actor_email TEXT,
  practice_id UUID,
  action TEXT NOT NULL,
  area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_hash TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Nur service_role darf lesen/schreiben (normale Nutzer haben keinen Zugriff).
DROP POLICY IF EXISTS "Service role can manage audit_logs" ON public.audit_logs;
CREATE POLICY "Service role can manage audit_logs" ON public.audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.audit_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

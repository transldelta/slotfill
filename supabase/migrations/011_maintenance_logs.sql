-- =============================================================
-- SlotFill – Migration 011: Wartungs-/Reparatur-Protokoll
-- =============================================================

CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  problem_type TEXT NOT NULL,
  affected_table TEXT,
  affected_id UUID,
  action TEXT,
  result TEXT,
  error_message TEXT,
  dry_run BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created_at
ON public.maintenance_logs(created_at DESC);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage maintenance_logs" ON public.maintenance_logs;
CREATE POLICY "Service role can manage maintenance_logs" ON public.maintenance_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.maintenance_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

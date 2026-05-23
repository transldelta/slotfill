-- =============================================================
-- SlotFill – Migration 008: Admin-Panel
-- =============================================================
-- Muss im Supabase SQL Editor ausgeführt werden, BEVOR das
-- Admin-Panel genutzt wird. Die API-Routen ändern niemals das Schema.
-- =============================================================

-- Banned-Spalte für Praxen (Sperrung statt Löschung)
ALTER TABLE public.practices
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;

-- Admin-Flag
ALTER TABLE public.practices
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Index für schnellere Admin-Abfragen
CREATE INDEX IF NOT EXISTS idx_practices_is_admin
ON public.practices(is_admin) WHERE is_admin = true;

CREATE INDEX IF NOT EXISTS idx_practices_banned
ON public.practices(banned) WHERE banned = false;

-- Error-Logs-Tabelle (nur wenn sie NICHT bereits existiert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'error_logs'
  ) THEN
    CREATE TABLE public.error_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      message TEXT,
      stack TEXT,
      route TEXT
    );
  END IF;
END $$;

-- Grants für service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.practices TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.error_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

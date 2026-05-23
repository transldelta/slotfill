-- =============================================================
-- SlotFill – Migration 009: Marketing, Blog & Kontakt
-- =============================================================
-- Robust und mehrfach ausführbar. Keine ALTER TABLE in API-Routen.
-- =============================================================

-- Blog-Artikel (existiert ggf. bereits aus Migration 001 – dann no-op).
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fehlende Spalten ergänzen (falls die Tabelle aus 001 stammt).
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
ON public.blog_posts(published_at);

-- Kontakt-/Support-Nachrichten.
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grants für service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_posts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_messages TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

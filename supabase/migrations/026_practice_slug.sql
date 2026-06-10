-- =============================================================
-- ClinicSlotHub – Migration 026: practices.slug
-- =============================================================
-- Fügt einen eindeutigen, URL-sicheren Slug zur practices-Tabelle
-- hinzu. Der Slug dient als öffentliche Praxis-Kennung in der
-- patientenseitigen Buchungs-URL:
--   /book/zahnarzt-mueller
--
-- IDEMPOTENT: Kann mehrfach ohne Fehler ausgeführt werden.
-- =============================================================

-- 1. Spalte hinzufügen (NULL erlaubt für bestehende Praxen zunächst)
ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Index (UNIQUE, für schnelle slug→id Suche)
CREATE UNIQUE INDEX IF NOT EXISTS practices_slug_unique
  ON public.practices (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_practices_slug
  ON public.practices (slug);

-- 3. Slugs für bestehende Praxen auto-generieren
--    Strategie: Praxisname → Kleinbuchstaben → Umlaute → Sonderzeichen
--    → Leerzeichen durch Bindestriche → Mehrfach-Bindestriche kollabieren
--    → Leading/Trailing Bindestriche entfernen.
--    Bei Konflikt (UNIQUE-Verletzung): Suffix -2, -3, … anhängen.
DO $$
DECLARE
  rec    RECORD;
  base   TEXT;
  candidate TEXT;
  counter  INT;
BEGIN
  FOR rec IN
    SELECT id, name FROM public.practices
    WHERE slug IS NULL
    ORDER BY created_at
  LOOP
    -- Basis-Slug aus Praxisname
    base := lower(
      regexp_replace(
        translate(
          translate(
            translate(
              translate(
                translate(
                  translate(
                    lower(COALESCE(rec.name, 'praxis')),
                    'äöüß', 'aouss'   -- Umlaute-Approximation
                  ),
                  'ÄÖÜÁÀÂÉÈÊÍÌÎÓÒÔÚÙÛÑÇ', 'aouaaaeeeiiiooouuunc'
                ),
                'àáâãäå', 'aaaaaa'
              ),
              'èéêë', 'eeee'
            ),
            'ìíîï', 'iiii'
          ),
          'òóôõö', 'ooooo'
        ),
        '[^a-z0-9]+', '-', 'g'
      )
    );
    -- Führende/abschließende Bindestriche entfernen
    base := trim(both '-' from base);
    -- Leerstring-Schutz
    IF base = '' OR base IS NULL THEN
      base := 'praxis';
    END IF;
    -- Max-Länge 80 Zeichen
    base := left(base, 80);

    -- Unique-Kollisionen auflösen
    candidate := base;
    counter := 2;
    WHILE EXISTS (
      SELECT 1 FROM public.practices WHERE slug = candidate
    ) LOOP
      candidate := base || '-' || counter;
      counter := counter + 1;
    END LOOP;

    UPDATE public.practices SET slug = candidate WHERE id = rec.id;
  END LOOP;
END $$;

-- Hinweis: Die practices-Tabelle hat kein RLS aktiviert.
-- Datenzugriff ausschließlich über service-role-Client auf dem Server.
-- Die öffentliche API (/api/practices/[slug]) gibt NUR (id, name, slug)
-- zurück – niemals auth_uid, email, phone, address oder interne Felder.

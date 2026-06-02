-- =============================================================
-- SlotFill – Migration 016: feedback_reviews
-- =============================================================
-- Speichert Patienten-Feedback / Bewertungen.
--
-- Sicherheitsregeln:
--   - visibility DEFAULT 'private' – niemals automatisch öffentlich
--   - 1–3 Sterne dürfen nie visibility='public' sein (CHECK-Constraint)
--   - consent_to_publish DEFAULT false
--   - reviewed_by_admin DEFAULT false
--   - RLS: Tenant darf nur eigene Zeilen lesen/schreiben
--   - Service-Role: Vollzugriff (für Admin-API)
--   - Anonym: nur INSERT (Feedback absenden, kein Lesen fremder Daten)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.feedback_reviews (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID        REFERENCES public.practices(id) ON DELETE SET NULL,
  rating             SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text      TEXT,
  customer_name      TEXT,
  customer_email     TEXT,
  -- Sichtbarkeit: 'private' (Default) oder 'public' (nur nach Admin-Freigabe)
  visibility         TEXT        NOT NULL DEFAULT 'private'
                                 CHECK (visibility IN ('private', 'public')),
  -- Status-Workflow: new → reviewed → resolved | archived
  status             TEXT        NOT NULL DEFAULT 'new'
                                 CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
  -- Einwilligung zur Veröffentlichung (aktiv durch Patient gesetzt)
  consent_to_publish BOOLEAN     NOT NULL DEFAULT false,
  -- Admin-Prüfung abgeschlossen
  reviewed_by_admin  BOOLEAN     NOT NULL DEFAULT false,
  reviewed_by        TEXT,
  reviewed_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Sicherheits-Constraint: 1–3 Sterne niemals öffentlich
  CONSTRAINT low_rating_stays_private
    CHECK (rating > 3 OR visibility = 'private'),

  -- Constraint: öffentlich nur wenn Einwilligung UND Admin-Review
  CONSTRAINT public_requires_consent_and_review
    CHECK (
      visibility = 'private'
      OR (consent_to_publish = true AND reviewed_by_admin = true AND rating >= 4)
    )
);

CREATE INDEX IF NOT EXISTS idx_feedback_reviews_tenant_id
  ON public.feedback_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviews_status
  ON public.feedback_reviews(status);
CREATE INDEX IF NOT EXISTS idx_feedback_reviews_rating
  ON public.feedback_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_reviews_created_at
  ON public.feedback_reviews(created_at DESC);

ALTER TABLE public.feedback_reviews ENABLE ROW LEVEL SECURITY;

-- Praxis darf nur eigene Feedbacks lesen
DROP POLICY IF EXISTS "Tenant can read own feedback" ON public.feedback_reviews;
CREATE POLICY "Tenant can read own feedback"
  ON public.feedback_reviews FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.practices
      WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Feedbacks updaten (Status-Änderungen via Admin)
DROP POLICY IF EXISTS "Tenant can update own feedback" ON public.feedback_reviews;
CREATE POLICY "Tenant can update own feedback"
  ON public.feedback_reviews FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.practices
      WHERE auth_uid = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.practices
      WHERE auth_uid = auth.uid()
    )
  );

-- Anonym darf Feedback einreichen (kein tenant_id erforderlich für öffentliche Seite)
DROP POLICY IF EXISTS "Anon can insert feedback" ON public.feedback_reviews;
CREATE POLICY "Anon can insert feedback"
  ON public.feedback_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Sicherheit: visibility muss 'private' bleiben beim Einreichen
    visibility = 'private'
    AND reviewed_by_admin = false
  );

-- Service-Role: Vollzugriff (Admin-API)
DROP POLICY IF EXISTS "Service role can manage feedback" ON public.feedback_reviews;
CREATE POLICY "Service role can manage feedback"
  ON public.feedback_reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON TABLE public.feedback_reviews TO authenticated;
GRANT INSERT ON TABLE public.feedback_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback_reviews TO service_role;

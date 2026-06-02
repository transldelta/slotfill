-- =============================================================
-- SlotFill – Migration 018: booking_requests
-- =============================================================
-- Online-Terminanfragen von Patienten.
--
-- Sicherheitsregeln:
--   - auto_confirmed DEFAULT false
--   - privacy_accepted MUSS true sein (CHECK)
--   - status DEFAULT 'pending_confirmation'
--   - RLS: Tenant darf nur eigene Anfragen lesen
--   - Anonym: nur INSERT mit privacy_accepted=true
-- =============================================================

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID        REFERENCES public.practices(id) ON DELETE SET NULL,
  patient_name     TEXT        NOT NULL,
  patient_email    TEXT        NOT NULL,
  patient_phone    TEXT,
  preferred_time   TEXT        NOT NULL,
  note             TEXT,
  -- Status-Workflow
  status           TEXT        NOT NULL DEFAULT 'pending_confirmation'
                               CHECK (status IN (
                                 'booking_request', 'pending_confirmation',
                                 'confirmed', 'declined', 'cancelled'
                               )),
  -- Datenschutz/Buchungshinweis wurde akzeptiert (Pflichtfeld)
  privacy_accepted BOOLEAN     NOT NULL DEFAULT false
                               CHECK (privacy_accepted = true),
  -- Automatische Bestätigung nur wenn bewusst aktiviert
  auto_confirmed   BOOLEAN     NOT NULL DEFAULT false,
  internal_note    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_tenant_id
  ON public.booking_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status
  ON public.booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at
  ON public.booking_requests(created_at DESC);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Praxis darf nur eigene Anfragen lesen
DROP POLICY IF EXISTS "Tenant can read own booking requests" ON public.booking_requests;
CREATE POLICY "Tenant can read own booking requests"
  ON public.booking_requests FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.practices
      WHERE auth_uid = auth.uid()
    )
  );

-- Praxis darf eigene Anfragen updaten (Status-Änderungen)
DROP POLICY IF EXISTS "Tenant can update own booking requests" ON public.booking_requests;
CREATE POLICY "Tenant can update own booking requests"
  ON public.booking_requests FOR UPDATE
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

-- Anonym darf Anfrage einreichen (privacy_accepted=true wird durch CHECK erzwungen)
DROP POLICY IF EXISTS "Anon can insert booking request" ON public.booking_requests;
CREATE POLICY "Anon can insert booking request"
  ON public.booking_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    privacy_accepted = true
    AND auto_confirmed = false
  );

-- Service-Role: Vollzugriff
DROP POLICY IF EXISTS "Service role can manage booking requests" ON public.booking_requests;
CREATE POLICY "Service role can manage booking requests"
  ON public.booking_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON TABLE public.booking_requests TO authenticated;
GRANT INSERT ON TABLE public.booking_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.booking_requests TO service_role;

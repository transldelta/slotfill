-- =============================================================
-- SlotFill – Migration 017: improvement_tickets
-- =============================================================
-- Internes Verbesserungs-Tracking-System.
-- Wird automatisch erstellt wenn rating <= 3.
--
-- Das System darf NICHT automatisch:
--   - öffentliche Bewertungen löschen
--   - Google-Bewertungen manipulieren
--   - Code ändern
--   - Preise ändern
--   - medizinische Entscheidungen treffen
--   - echte Nachrichten ohne Provider senden
-- =============================================================

CREATE TABLE IF NOT EXISTS public.improvement_tickets (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        REFERENCES public.practices(id) ON DELETE SET NULL,
  feedback_id         UUID        REFERENCES public.feedback_reviews(id) ON DELETE SET NULL,
  -- Analyse-Ergebnisse (automatisch gesetzt, READ-ONLY für Admin)
  category            TEXT        NOT NULL DEFAULT 'other'
                                  CHECK (category IN (
                                    'usability', 'pricing', 'communication',
                                    'booking', 'notification', 'trust',
                                    'legal_privacy', 'technical_bug', 'other'
                                  )),
  severity            TEXT        NOT NULL DEFAULT 'medium'
                                  CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
  summary             TEXT        NOT NULL DEFAULT '',
  suggested_action    TEXT        NOT NULL DEFAULT '',
  -- Status-Workflow
  status              TEXT        NOT NULL DEFAULT 'new'
                                  CHECK (status IN (
                                    'new', 'reviewed', 'action_planned',
                                    'in_progress', 'resolved', 'rejected'
                                  )),
  rejection_reason    TEXT,
  assigned_role       TEXT        NOT NULL DEFAULT 'admin'
                                  CHECK (assigned_role IN ('admin', 'ceo', 'support', 'product')),
  -- Recurring-Issue-Erkennung
  recurring_issue_key TEXT,
  is_recurring        BOOLEAN     NOT NULL DEFAULT false,
  -- Admin-Prüfung
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_improvement_tickets_tenant_id
  ON public.improvement_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_improvement_tickets_status
  ON public.improvement_tickets(status);
CREATE INDEX IF NOT EXISTS idx_improvement_tickets_severity
  ON public.improvement_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_improvement_tickets_recurring_key
  ON public.improvement_tickets(recurring_issue_key);
CREATE INDEX IF NOT EXISTS idx_improvement_tickets_created_at
  ON public.improvement_tickets(created_at DESC);

ALTER TABLE public.improvement_tickets ENABLE ROW LEVEL SECURITY;

-- Praxis darf nur eigene Tickets lesen
DROP POLICY IF EXISTS "Tenant can read own tickets" ON public.improvement_tickets;
CREATE POLICY "Tenant can read own tickets"
  ON public.improvement_tickets FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.practices
      WHERE auth_uid = auth.uid()
    )
  );

-- Service-Role: Vollzugriff (Admin-API)
DROP POLICY IF EXISTS "Service role can manage tickets" ON public.improvement_tickets;
CREATE POLICY "Service role can manage tickets"
  ON public.improvement_tickets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON TABLE public.improvement_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.improvement_tickets TO service_role;

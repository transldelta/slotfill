-- =============================================================
-- SlotFill – Migration 006: Pläne, Abos & Stripe
-- =============================================================
-- Robust und mehrfach ausführbar (IF NOT EXISTS / ON CONFLICT).
-- =============================================================

-- -------------------------------------------------------------
-- 2.1 plans
-- -------------------------------------------------------------
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS plan_key text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS price_monthly numeric;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_patients int;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_notifications_per_month int;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS feature_keys jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS plans_plan_key_key ON public.plans(plan_key);

-- Pläne anlegen/aktualisieren (ohne Duplikate, mehrfach ausführbar)
INSERT INTO public.plans
  (plan_key, name, price_monthly, max_patients, max_notifications_per_month, feature_keys)
VALUES
  ('starter', 'Starter', 29, 100, 50,
   '["whatsappNotifications","patientManagement","trial14Days"]'::jsonb),
  ('professional', 'Professional', 69, 500, 250,
   '["everythingInStarter","advancedStatistics","multipleUsers"]'::jsonb),
  ('praxis_plus', 'Praxis Plus', 99, 9999, 1000,
   '["everythingInProfessional","unlimitedPatients","prioritySupport"]'::jsonb)
ON CONFLICT (plan_key) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  max_patients = EXCLUDED.max_patients,
  max_notifications_per_month = EXCLUDED.max_notifications_per_month,
  feature_keys = EXCLUDED.feature_keys;

-- -------------------------------------------------------------
-- 2.2 subscriptions
-- -------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS notifications_used_this_month int DEFAULT 0;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.subscriptions ALTER COLUMN status SET DEFAULT 'trial';
ALTER TABLE public.subscriptions ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '14 days');

-- Alte Status-Werte auf das neue Schema normalisieren, bevor der
-- Check-Constraint hinzugefügt wird.
UPDATE public.subscriptions SET status = 'trial' WHERE status = 'trialing';
UPDATE public.subscriptions SET status = 'cancelled' WHERE status = 'canceled';

-- Check-Constraint robust hinzufügen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('trial','active','cancelled','past_due'));
  END IF;
END $$;

-- -------------------------------------------------------------
-- 2.3 RPC-Funktion für Limits
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_notification_count(
  p_practice_id UUID,
  p_count INT
)
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    notifications_used_this_month = COALESCE(notifications_used_this_month, 0) + p_count,
    updated_at = NOW()
  WHERE practice_id = p_practice_id;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------
-- 2.4 Grants für service_role
-- -------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.plans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscriptions TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_notification_count(UUID, INT) TO service_role;

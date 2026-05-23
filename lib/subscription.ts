import { createClient } from "@/lib/supabase";

export type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
  max_patients: number;
  max_notifications_per_month: number;
  feature_keys: string[];
  stripe_price_id: string | null;
};

export type Subscription = {
  id: string;
  practice_id: string;
  plan_id: string | null;
  status: string;
  notifications_used_this_month: number;
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

const PLAN_COLUMNS =
  "id, plan_key, name, price_monthly, max_patients, max_notifications_per_month, feature_keys, stripe_price_id";

type Admin = ReturnType<typeof createClient>;

async function loadStarterPlan(admin: Admin): Promise<Plan | null> {
  const { data } = await admin
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("plan_key", "starter")
    .maybeSingle();
  return (data as Plan | null) ?? null;
}

async function loadPlanById(admin: Admin, planId: string): Promise<Plan | null> {
  const { data } = await admin
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("id", planId)
    .maybeSingle();
  return (data as Plan | null) ?? null;
}

export type SubscriptionResult = {
  subscription: Subscription;
  plan: Plan | null;
  created: boolean;
};

// Lädt die Subscription einer Praxis inkl. Plan. Existiert noch keine,
// wird automatisch eine Trial-Subscription auf dem Starter-Plan angelegt.
export async function getOrCreatePracticeSubscription(
  practiceId: string,
): Promise<SubscriptionResult> {
  const admin = createClient();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("*")
    .eq("practice_id", practiceId)
    .order("created_at", { ascending: true })
    .limit(1);

  let subscription = (existing?.[0] as Subscription | undefined) ?? null;

  if (!subscription) {
    const starter = await loadStarterPlan(admin);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: created, error } = await admin
      .from("subscriptions")
      .insert({
        practice_id: practiceId,
        plan_id: starter?.id ?? null,
        status: "trial",
        trial_ends_at: trialEndsAt,
        notifications_used_this_month: 0,
      })
      .select("*")
      .single();
    if (error || !created) {
      console.error("[getOrCreatePracticeSubscription] Anlegen fehlgeschlagen:", error);
      throw new Error("SUBSCRIPTION_CREATE_FAILED");
    }
    return { subscription: created as Subscription, plan: starter, created: true };
  }

  // Bestehende Subscription ohne Plan -> auf Starter setzen (self-healing).
  if (!subscription.plan_id) {
    const starter = await loadStarterPlan(admin);
    if (starter) {
      await admin
        .from("subscriptions")
        .update({ plan_id: starter.id, updated_at: new Date().toISOString() })
        .eq("id", subscription.id);
      subscription = { ...subscription, plan_id: starter.id };
      return { subscription, plan: starter, created: false };
    }
  }

  const plan = subscription.plan_id
    ? await loadPlanById(admin, subscription.plan_id)
    : null;
  return { subscription, plan, created: false };
}

export async function getPracticeSubscription(
  practiceId: string,
): Promise<SubscriptionResult> {
  return getOrCreatePracticeSubscription(practiceId);
}

export type LimitInfo = {
  maxNotifications: number;
  usedNotifications: number;
  remaining: number;
};

// Prüft das monatliche Benachrichtigungs-Limit. Wirft bei Überschreitung
// einen Fehler mit der Nachricht "LIMIT_REACHED".
export async function checkNotificationLimit(
  practiceId: string,
): Promise<LimitInfo> {
  const { subscription, plan } = await getOrCreatePracticeSubscription(practiceId);
  const maxNotifications = plan?.max_notifications_per_month ?? 0;
  const usedNotifications = subscription.notifications_used_this_month ?? 0;

  if (usedNotifications >= maxNotifications) {
    throw new Error("LIMIT_REACHED");
  }

  return {
    maxNotifications,
    usedNotifications,
    remaining: maxNotifications - usedNotifications,
  };
}

// Erhöht den Zähler der verbrauchten Benachrichtigungen über die RPC.
export async function incrementNotificationCount(
  practiceId: string,
  count: number,
): Promise<void> {
  if (count <= 0) return;
  const admin = createClient();
  const { error } = await admin.rpc("increment_notification_count", {
    p_practice_id: practiceId,
    p_count: count,
  });
  if (error) {
    console.error("[incrementNotificationCount] RPC fehlgeschlagen:", error);
  }
}

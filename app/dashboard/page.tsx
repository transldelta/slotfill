import { createClient, createServerClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";

export default async function DashboardPage() {
  const t = await getTranslations();

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createClient();
  const { data: practice } = await admin
    .from("practices")
    .select("name")
    .eq("auth_uid", user?.id ?? "")
    .single();

  const practiceName = practice?.name ?? "";

  const cards = [
    { label: t("dashboard.patients"), value: 0 },
    { label: t("dashboard.appointments"), value: 0 },
    { label: t("dashboard.notifications"), value: 0 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        {t("dashboard.welcome", { praxisName: practiceName })}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-secondary/20 p-5"
          >
            <div className="text-sm text-muted-foreground">{card.label}</div>
            <div className="mt-2 text-3xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { getCurrentPractice } from "@/lib/practice";
import { getTranslations } from "@/lib/i18n";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentPractice();

  if (!ctx) {
    // Unterscheiden: gar nicht eingeloggt vs. eingeloggt, aber Onboarding fehlt.
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/auth/login");
    }

    // Eingeloggt, aber (noch) keine Praxis -> freundlicher Hinweis statt Loop.
    const t = await getTranslations();
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
        <p className="max-w-md text-slate-700 dark:text-slate-200">
          {t("dashboard.accountSetup")}
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("dashboard.retry")}
        </Link>
      </main>
    );
  }

  return (
    <DashboardShell practiceName={ctx.practiceName}>{children}</DashboardShell>
  );
}

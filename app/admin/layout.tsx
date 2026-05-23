import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getTranslations } from "@/lib/i18n";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();

  try {
    await requireAdmin();
  } catch {
    // Generische Zugriffsverweigerung (kein Hinweis auf interne Strukturen).
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
        <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {t("admin.accessDenied")}
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("admin.backToDashboard")}
        </Link>
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

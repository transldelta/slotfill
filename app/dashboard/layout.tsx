import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServerClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();

  // Eingeloggten Benutzer ermitteln (zusätzlich zur Middleware).
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Zugehörige Praxis laden (Service-Role, da noch keine RLS-Policies).
  const admin = createClient();
  const { data: practice } = await admin
    .from("practices")
    .select("name")
    .eq("auth_uid", user.id)
    .single();

  const practiceName = practice?.name ?? "";

  const navItems = [
    { href: "/dashboard", label: t("dashboard.overview") },
    { href: "/dashboard/patients", label: t("dashboard.patients") },
    { href: "/dashboard/waitlist", label: t("dashboard.waitlist") },
    { href: "/dashboard/appointments", label: t("dashboard.appointments") },
    { href: "/dashboard/notifications", label: t("dashboard.notifications") },
    { href: "/dashboard/subscription", label: t("dashboard.subscription") },
    { href: "/dashboard/settings", label: t("dashboard.settings") },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-secondary/20 p-4 sm:block">
        <div className="mb-6 text-lg font-bold">SlotFill</div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm transition hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="font-medium">{practiceName}</span>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  ListOrdered,
  Menu,
  Moon,
  Rocket,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { useTheme } from "@/components/theme-provider";
import { LogoutButton } from "@/app/dashboard/logout-button";

export function DashboardShell({
  practiceName,
  children,
}: {
  practiceName: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: t("dashboard.overview"), icon: LayoutDashboard },
    { href: "/dashboard/patients", label: t("dashboard.patients"), icon: Users },
    { href: "/dashboard/waitlist", label: t("dashboard.waitlist"), icon: ListOrdered },
    { href: "/dashboard/appointments", label: t("dashboard.appointments"), icon: Calendar },
    { href: "/dashboard/notifications", label: t("dashboard.notifications"), icon: Bell },
    { href: "/dashboard/subscription", label: t("dashboard.subscription"), icon: CreditCard },
    { href: "/dashboard/onboarding", label: t("onboarding.title"), icon: Rocket },
    { href: "/dashboard/trust", label: t("trust.title"), icon: ShieldCheck },
    { href: "/dashboard/help", label: t("help.title"), icon: HelpCircle },
    { href: "/dashboard/settings", label: t("dashboard.settings"), icon: Settings },
  ];

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("sidebar.brand")}
        </span>
        <button
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 sm:hidden"
          onClick={() => setOpen(false)}
          aria-label={t("sidebar.toggle")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-2 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-5 w-5" />
              {t("dashboard.lightMode")}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              {t("dashboard.darkMode")}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:flex">
        {sidebar}
      </aside>

      {/* Sidebar Mobile (Overlay) */}
      {open && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-slate-900">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="transition-all duration-200 sm:pl-64">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
              onClick={() => setOpen(true)}
              aria-label={t("sidebar.toggle")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {practiceName}
            </span>
          </div>
          <LogoutButton />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

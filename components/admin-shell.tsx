"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Bell,
  Bug,
  Building2,
  LayoutDashboard,
  Menu,
  Package,
  X,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/admin", label: t("admin.overview"), icon: LayoutDashboard },
    { href: "/admin/practices", label: t("admin.practices"), icon: Building2 },
    { href: "/admin/notifications", label: t("admin.notifications"), icon: Bell },
    { href: "/admin/plans", label: t("admin.plans"), icon: Package },
    { href: "/admin/errors", label: t("admin.errors"), icon: Bug },
    { href: "/admin/system-check", label: t("admin.systemCheck"), icon: Activity },
  ];

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">{t("admin.title")}</span>
        <button
          className="rounded-md p-1 text-slate-300 hover:bg-slate-800 sm:hidden"
          onClick={() => setOpen(false)}
          aria-label={t("admin.title")}
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
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("admin.backToDashboard")}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col sm:flex">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="sm:pl-64">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <button
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
            onClick={() => setOpen(true)}
            aria-label={t("admin.title")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {t("admin.title")}
          </span>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

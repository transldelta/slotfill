"use client";

import { signOut } from "../auth/actions";
import { useTranslations } from "@/lib/i18n";

export function LogoutButton() {
  const t = useTranslations();

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border border-border px-3 py-1.5 text-sm transition hover:bg-secondary"
      >
        {t("auth.logout")}
      </button>
    </form>
  );
}

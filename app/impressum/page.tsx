import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("legal.impressumTitle")} – SlotFill`,
    robots: { index: false, follow: false },
  };
}

export default async function ImpressumPage() {
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        {t("nav.brand")}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {t("legal.impressumTitle")}
      </h1>

      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        {t("legal.draftNotice")}
      </p>

      <div className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
        <p>{t("legal.impressumIntro")}</p>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            {t("legal.impressumContact")}
          </h2>
          <p className="mt-1">SlotFill</p>
          <p>E-Mail: transl.delta@gmail.com</p>
        </div>
      </div>
    </main>
  );
}

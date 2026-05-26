import Link from "next/link";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const t = await getTranslations();

  const quickstart = ["qs1", "qs2", "qs3", "qs4", "qs5"];
  const faq = [
    { q: "q1", a: "a1" },
    { q: "q2", a: "a2" },
    { q: "q3", a: "a3" },
    { q: "q4", a: "a4" },
    { q: "q5", a: "a5" },
  ];

  const card =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("help.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("help.subtitle")}
        </p>
      </div>

      <section className={card}>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("help.quickstart")}
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {quickstart.map((k) => (
            <li key={k}>{t(`help.${k}`)}</li>
          ))}
        </ol>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("help.faq")}
        </h2>
        <dl className="space-y-4">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-slate-900 dark:text-slate-100">
                {t(`help.${item.q}`)}
              </dt>
              <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t(`help.${item.a}`)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Link
        href="/kontakt"
        className="inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {t("help.contactSupport")}
      </Link>
    </div>
  );
}

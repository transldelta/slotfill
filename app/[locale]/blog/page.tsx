import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { STATIC_BLOG_POSTS, type StaticPost } from "@/lib/blog-data";
import { locales, type Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slotfill.de";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const title = `${t("title")} – SlotFill`;
  const description = t("subtitle");

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/blog`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/blog`,
      siteName: "SlotFill",
      locale: locale === "de" ? "de_DE" : locale,
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

/** Lädt Artikel aus der DB; fällt auf statische Artikel zurück wenn leer. */
async function loadPosts(): Promise<Post[]> {
  try {
    const admin = createClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("slug, title, excerpt, published_at")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });
    if (error || !data || data.length === 0) return staticFallback();
    return data as Post[];
  } catch {
    return staticFallback();
  }
}

function staticFallback(): Post[] {
  return [...STATIC_BLOG_POSTS]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )
    .map((p: StaticPost) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      published_at: p.published_at,
    }));
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const posts = await loadPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/blog" />
      </div>
      <div className="mb-10">
        <Link
          href={`/${locale}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {tNav("brand")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            {post.published_at && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(post.published_at), "dd.MM.yyyy")}
              </p>
            )}
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {post.excerpt}
              </p>
            )}
            <Link
              href={`/${locale}/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("readMore")}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

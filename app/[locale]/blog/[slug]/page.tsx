import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { STATIC_BLOG_POSTS } from "@/lib/blog-data";
import { getLocalizedPost } from "@/lib/blog-translations";
import { locales, type Locale } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";

export const dynamic = "force-dynamic";

const APP_URL = CANONICAL_URL;

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  published_at: string | null;
};

/** Statische Slugs × Locales für generateStaticParams. */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    STATIC_BLOG_POSTS.map((p) => ({ locale, slug: p.slug })),
  );
}

async function loadPost(slug: string, locale: string): Promise<Post | null> {
  // 1. DB-Versuch
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, title, excerpt, content, published_at")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();
    if (data) return data as Post;
  } catch {
    // DB nicht verfügbar → lokalisierter statischer Fallback
  }

  // 2. Lokalisierter statischer Fallback
  const staticPost = getLocalizedPost(slug, locale);
  if (staticPost) {
    return {
      slug: staticPost.slug,
      title: staticPost.title,
      excerpt: staticPost.excerpt,
      content: staticPost.content,
      published_at: staticPost.published_at,
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await loadPost(slug, locale);
  if (!post) return { title: "ClinicSlotHub Blog" };

  const title = `${post.title} – ClinicSlotHub`;
  const description = post.excerpt ?? "Praxistipps von ClinicSlotHub.";

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: `/${locale}/blog/${post.slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/blog/${post.slug}`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/blog/${post.slug}`,
      siteName: "ClinicSlotHub",
      locale: locale === "de" ? "de_DE" : locale,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function LocaleBlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const post = await loadPost(slug, locale);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath={`/blog/${slug}`} />
      </div>
      <Link
        href={`/${locale}/blog`}
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← {t("back")}
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {post.title}
      </h1>
      {post.published_at && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {format(new Date(post.published_at), "dd.MM.yyyy")}
        </p>
      )}
      {post.excerpt && (
        <p className="mt-3 border-l-4 border-blue-500 pl-4 text-base font-medium text-slate-600 dark:text-slate-300">
          {post.excerpt}
        </p>
      )}
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
        {post.content}
      </div>

      {/* CTA am Ende */}
      <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center dark:border-blue-900/50 dark:bg-blue-950/30">
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          Arzttermine online buchen
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Wählen Sie eine verfügbare Zeit und senden Sie Ihre Anfrage an die Praxis.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/termin-buchen`}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {tNav("bookAppointment")}
          </Link>
          <Link
            href={`/${locale}/kontakt`}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {tNav("contact")}
          </Link>
        </div>
      </div>
    </main>
  );
}

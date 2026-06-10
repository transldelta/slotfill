import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { STATIC_BLOG_POSTS, type StaticPost } from "@/lib/blog-data";

import { CANONICAL_URL } from "@/lib/brand";

export const dynamic = "force-dynamic";

const APP_URL = CANONICAL_URL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = `${t("blog.title")} – ClinicSlotHub`;
  const description = t("blog.subtitle");

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      url: "/blog",
      siteName: "ClinicSlotHub",
      locale: "de_DE",
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

export default async function BlogPage() {
  const t = await getTranslations();
  const posts = await loadPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t("nav.brand")}
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t("blog.title")}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t("blog.subtitle")}
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
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("blog.readMore")}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

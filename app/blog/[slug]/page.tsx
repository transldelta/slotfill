import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { STATIC_BLOG_POSTS, getStaticPost } from "@/lib/blog-data";

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

/** Statische Slugs für generateStaticParams (Vorrendering der bekannten Artikel). */
export function generateStaticParams() {
  return STATIC_BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

async function loadPost(slug: string): Promise<Post | null> {
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
    // DB nicht verfügbar → statischer Fallback
  }

  // 2. Statischer Fallback
  const staticPost = getStaticPost(slug);
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
  params: { slug: string };
}): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post) return { title: "ClinicSlotHub Blog" };

  const title = `${post.title} – ClinicSlotHub`;
  const description = post.excerpt ?? "Praxistipps von ClinicSlotHub.";

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      siteName: "ClinicSlotHub",
      locale: "de_DE",
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const t = await getTranslations();
  const post = await loadPost(params.slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/blog"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← {t("blog.back")}
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
          ClinicSlotHub kostenlos testen
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          14 Tage kostenlos – keine Kreditkarte erforderlich.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Kostenlos testen
          </Link>
          <Link
            href="/kontakt"
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </main>
  );
}

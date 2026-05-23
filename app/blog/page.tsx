import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("blog.title")} – SlotFill`,
    description: t("blog.subtitle"),
  };
}

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

async function loadPosts(): Promise<Post[]> {
  try {
    const admin = createClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("slug, title, excerpt, published_at")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data as Post[]) ?? [];
  } catch {
    return [];
  }
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

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title={t("blog.empty")} description={t("blog.subtitle")} />
      ) : (
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
      )}
    </main>
  );
}

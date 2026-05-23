import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  published_at: string | null;
};

async function loadPost(slug: string): Promise<Post | null> {
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, title, excerpt, content, published_at")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();
    return (data as Post | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await loadPost(params.slug);
  if (!post) return { title: "SlotFill Blog" };
  return {
    title: `${post.title} – SlotFill`,
    description: post.excerpt ?? undefined,
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
      <div className="mt-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {post.content}
      </div>
    </main>
  );
}

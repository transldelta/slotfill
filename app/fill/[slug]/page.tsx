"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useTranslations } from "@/lib/i18n";

type LinkInfo = {
  practiceName: string | null;
  scheduledTime: string | null;
  expiresAt: string | null;
};

type View =
  | "loading"
  | "available"
  | "claimed"
  | "expired"
  | "error"
  | "success";

export default function FillPage() {
  const t = useTranslations();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [view, setView] = useState<View>("loading");
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setView("loading");
    try {
      const res = await fetch(`/api/fill/${slug}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (data?.code === "LINK_AVAILABLE") {
        setInfo({
          practiceName: data.practice_name ?? null,
          scheduledTime: data.scheduled_time ?? null,
          expiresAt: data.expires_at ?? null,
        });
        setView("available");
      } else if (data?.code === "LINK_ALREADY_CLAIMED") {
        setView("claimed");
      } else if (data?.code === "LINK_EXPIRED") {
        setView("expired");
      } else {
        setView("error");
      }
    } catch {
      setView("error");
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function claim() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/fill/${slug}`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (data?.code === "CLAIM_SUCCESS") {
        setView("success");
      } else if (data?.code === "LINK_EXPIRED") {
        setView("expired");
      } else {
        setView("claimed");
      }
    } catch {
      setView("error");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string | null) {
    return iso ? format(new Date(iso), "dd.MM.yyyy HH:mm") : "—";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-secondary/20 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">{t("fill.title")}</h1>

        {view === "loading" && (
          <p className="text-muted-foreground">{t("fill.loading")}</p>
        )}

        {view === "error" && (
          <div>
            <p className="mb-4 text-muted-foreground">{t("fill.claimError")}</p>
            <button
              onClick={load}
              className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
            >
              {t("fill.retry")}
            </button>
          </div>
        )}

        {view === "expired" && (
          <p className="text-amber-700">{t("fill.linkExpired")}</p>
        )}

        {view === "claimed" && (
          <p className="text-amber-700">{t("fill.linkAlreadyClaimed")}</p>
        )}

        {view === "success" && (
          <p className="font-medium text-green-700">{t("fill.claimSuccess")}</p>
        )}

        {view === "available" && info && (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t("fill.practice")}</dt>
                <dd className="font-medium">{info.practiceName ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t("fill.date")}</dt>
                <dd className="font-medium">{formatDate(info.scheduledTime)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t("fill.expires")}</dt>
                <dd className="font-medium">{formatDate(info.expiresAt)}</dd>
              </div>
            </dl>

            <button
              onClick={claim}
              disabled={submitting}
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? t("fill.loading") : t("fill.claimButton")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

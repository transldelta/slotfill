/**
 * GET  /api/admin/feedback       – Liste aller Feedback-Einträge
 * PATCH /api/admin/feedback       – Status/Sichtbarkeit eines Eintrags ändern
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang (getAdminContext)
 * - Veröffentlichung: nur wenn rating >= 4, consent_to_publish=true,
 *   reviewed_by_admin wird auf true gesetzt
 * - rating <= 3 kann NICHT auf visibility='public' gesetzt werden
 * - Keine automatische Google-Review-Manipulation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = ctx.admin
    .from("feedback_reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === "low") query = query.lte("rating", 3);
  else if (filter === "high") query = query.gte("rating", 4);
  else if (filter === "new") query = query.eq("status", "new");
  else if (filter === "reviewed") query = query.eq("status", "reviewed");
  else if (filter === "public") query = query.eq("visibility", "public");
  else if (filter === "private") query = query.eq("visibility", "private");

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ feedback: data, total: count ?? 0, page, limit });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }

  const { id, action } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
  }

  // Lade aktuellen Eintrag
  const { data: current } = await ctx.admin
    .from("feedback_reviews")
    .select("rating, consent_to_publish, visibility, status")
    .eq("id", id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    reviewed_by: ctx.user.email ?? "admin",
    reviewed_at: new Date().toISOString(),
    reviewed_by_admin: true,
  };

  switch (action) {
    case "mark_reviewed":
      updates.status = "reviewed";
      break;

    case "publish":
      // Sicherheits-Check: nur bei rating >= 4 und consent_to_publish
      if (current.rating < 4) {
        return NextResponse.json(
          { code: "CANNOT_PUBLISH_LOW_RATING", message: "Bewertungen mit 1–3 Sternen dürfen nicht veröffentlicht werden." },
          { status: 422 },
        );
      }
      if (!current.consent_to_publish) {
        return NextResponse.json(
          { code: "NO_CONSENT", message: "Einwilligung zur Veröffentlichung fehlt." },
          { status: 422 },
        );
      }
      updates.visibility = "public";
      updates.status = "reviewed";
      break;

    case "set_private":
      updates.visibility = "private";
      updates.status = "reviewed";
      break;

    case "archive":
      updates.status = "archived";
      updates.visibility = "private";
      break;

    default:
      return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 400 });
  }

  const { error } = await ctx.admin
    .from("feedback_reviews")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: "OK", id, action });
}

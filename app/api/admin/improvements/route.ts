/**
 * GET   /api/admin/improvements  – Liste aller Improvement-Tickets
 * PATCH /api/admin/improvements  – Status eines Tickets ändern
 *
 * Sicherheitsregeln:
 * - Nur Admin-Zugang
 * - Keine automatische Code-Änderung
 * - Keine automatische Preisänderung
 * - Keine medizinischen Entscheidungen
 * - Status-Änderungen nur durch Admin/CEO (manuelle Freigabe)
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
    .from("improvement_tickets")
    .select(`
      *,
      feedback_reviews(rating, feedback_text, customer_name, created_at)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter === "urgent") query = query.eq("severity", "urgent");
  else if (filter === "high") query = query.in("severity", ["high", "urgent"]);
  else if (filter === "new") query = query.eq("status", "new");
  else if (filter === "recurring") query = query.eq("is_recurring", true);
  else if (filter === "unresolved") query = query.not("status", "in", '("resolved","rejected")');

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data, total: count ?? 0, page, limit });
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

  const { id, action, rejection_reason } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ code: "MISSING_ID" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    reviewed_by: ctx.user.email ?? "admin",
    reviewed_at: new Date().toISOString(),
  };

  switch (action) {
    case "mark_reviewed":
      updates.status = "reviewed";
      break;
    case "plan_action":
      updates.status = "action_planned";
      break;
    case "start_progress":
      updates.status = "in_progress";
      break;
    case "resolve":
      updates.status = "resolved";
      updates.resolved_at = new Date().toISOString();
      break;
    case "reject":
      updates.status = "rejected";
      if (rejection_reason && typeof rejection_reason === "string") {
        updates.rejection_reason = rejection_reason.slice(0, 500);
      }
      break;
    default:
      return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 400 });
  }

  const { error } = await ctx.admin
    .from("improvement_tickets")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ code: "DB_ERROR", message: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: "OK", id, action });
}

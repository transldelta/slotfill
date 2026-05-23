import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  is_admin: z.boolean().optional(),
  banned: z.boolean().optional(),
});

// PATCH /api/admin/practices/[id] – Admin- oder Sperr-Status setzen.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }

  const { data, error } = await admin
    .from("practices")
    .update({ ...parsed.data })
    .eq("id", params.id)
    .select("id, banned, is_admin")
    .maybeSingle();

  if (error) {
    console.error("[PATCH /api/admin/practices/[id]] Update fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ code: "PRACTICE_UPDATED", practice: data });
}

// DELETE /api/admin/practices/[id]
// Sicherheitsregel: Es wird NICHT hart gelöscht. Solange nicht geprüft ist,
// dass ALLE abhängigen Tabellen per ON DELETE CASCADE abgesichert sind, wird
// die Praxis nur gesperrt (banned = true).
// Nur aktivieren (echtes DELETE), wenn CASCADE geprüft wurde.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { data, error } = await admin
    .from("practices")
    .update({ banned: true })
    .eq("id", params.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  // Soft-Delete: gesperrt statt gelöscht.
  return NextResponse.json({ code: "PRACTICE_BANNED_INSTEAD" });
}

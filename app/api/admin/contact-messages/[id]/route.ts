import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// DELETE /api/admin/contact-messages/[id] – einzelne Nachricht löschen (nur Admins)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Fehlende ID" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[contact-messages] DELETE error:", error.message);
    return NextResponse.json({ error: "Löschen fehlgeschlagen" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

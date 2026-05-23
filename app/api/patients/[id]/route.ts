import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

// DELETE /api/patients/[id] – löscht einen Patienten der eigenen Praxis.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  // Nur löschen, wenn der Patient zur aktuellen Praxis gehört.
  const { data, error } = await admin
    .from("patients")
    .delete()
    .eq("id", params.id)
    .eq("practice_id", practiceId)
    .select("id");
  if (error) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

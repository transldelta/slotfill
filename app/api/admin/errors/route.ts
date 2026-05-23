import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/errors – letzte Fehlerlogs. Falls die Tabelle error_logs
// (noch) nicht existiert, wird robust ein leeres Array zurückgegeben.
export async function GET(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const { data, error } = await admin
    .from("error_logs")
    .select("id, timestamp, message, stack, route")
    .order("timestamp", { ascending: false })
    .limit(limit);

  // Tabelle fehlt o. Ä. -> leerer Zustand, kein Absturz.
  if (error) {
    return NextResponse.json({ code: "ERRORS_LOADED", errors: [] });
  }

  return NextResponse.json({ code: "ERRORS_LOADED", errors: data ?? [] });
}

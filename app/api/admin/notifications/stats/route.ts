import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/notifications/stats – aggregierte Benachrichtigungsdaten.
// Hinweis: Eine Klick-Erfassung (clicked) existiert noch nicht, daher 0.
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { data: rows, error } = await admin
    .from("sent_notifications")
    .select("practice_id, delivered");
  if (error) {
    console.error("[GET /api/admin/notifications/stats] Fehler:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  const totalSent = (rows ?? []).length;
  const totalDelivered = (rows ?? []).filter((r) => r.delivered === true).length;
  const totalClicked = 0; // Klick-Tracking folgt später.

  // Pro Praxis aggregieren.
  const byPracticeMap = new Map<string, { sent: number; delivered: number }>();
  for (const r of rows ?? []) {
    if (!r.practice_id) continue;
    const entry = byPracticeMap.get(r.practice_id) ?? { sent: 0, delivered: 0 };
    entry.sent += 1;
    if (r.delivered === true) entry.delivered += 1;
    byPracticeMap.set(r.practice_id, entry);
  }

  const practiceIds = Array.from(byPracticeMap.keys());
  const names = new Map<string, string>();
  if (practiceIds.length > 0) {
    const { data: practices } = await admin
      .from("practices")
      .select("id, name")
      .in("id", practiceIds);
    for (const p of practices ?? []) names.set(p.id, p.name);
  }

  const byPractice = practiceIds.map((id) => {
    const e = byPracticeMap.get(id)!;
    return {
      practiceId: id,
      name: names.get(id) ?? "—",
      sent: e.sent,
      delivered: e.delivered,
      clicked: 0,
      clickRate: 0,
    };
  });

  return NextResponse.json({
    code: "NOTIFICATION_STATS_LOADED",
    stats: { totalSent, totalDelivered, totalClicked, byPractice },
  });
}

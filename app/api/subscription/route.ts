import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";
import { getOrCreatePracticeSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

// GET /api/subscription – authentifiziert: Abo der aktuellen Praxis laden
// (legt bei Bedarf automatisch eine Trial-Subscription an).
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { subscription, plan, created } =
      await getOrCreatePracticeSubscription(ctx.practiceId);

    return NextResponse.json({
      code: created ? "SUBSCRIPTION_CREATED" : "SUBSCRIPTION_LOADED",
      subscription,
      plan,
    });
  } catch (err) {
    console.error("[GET /api/subscription] Fehler:", err);
    return NextResponse.json({ code: "SUBSCRIPTION_ERROR" }, { status: 500 });
  }
}

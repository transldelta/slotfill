import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/practices – alle Praxen inkl. Abo-Status und Plan.
export async function GET(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  let query = admin
    .from("practices")
    .select(
      "id, name, email, phone, created_at, banned, is_admin, subscriptions ( status, plans ( name, price_monthly ) )",
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[GET /api/admin/practices] Laden fehlgeschlagen:", error);
    return NextResponse.json({ code: "PRACTICES_ERROR" }, { status: 500 });
  }

  const practices = (data ?? []).map((p) => {
    const sub = Array.isArray(p.subscriptions)
      ? p.subscriptions[0]
      : p.subscriptions;
    const plan = sub
      ? Array.isArray(sub.plans)
        ? sub.plans[0]
        : sub.plans
      : null;
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      created_at: p.created_at,
      banned: p.banned ?? false,
      is_admin: p.is_admin ?? false,
      status: sub?.status ?? null,
      planName: plan?.name ?? null,
      planPrice: plan?.price_monthly ?? null,
    };
  });

  return NextResponse.json({ code: "PRACTICES_LOADED", practices });
}

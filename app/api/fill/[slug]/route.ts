import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/fill/[slug] – ÖFFENTLICH: Informationen zu einem Benachrichtigungs-Link.
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const admin = createClient();

  const { data: link } = await admin
    .from("notification_links")
    .select(
      "slug, is_claimed, expires_at, appointment_id, practices(name), appointments(scheduled_time, status)",
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ code: "LINK_NOT_FOUND" }, { status: 404 });
  }

  const practice = Array.isArray(link.practices) ? link.practices[0] : link.practices;
  const appointment = Array.isArray(link.appointments)
    ? link.appointments[0]
    : link.appointments;

  // Bereits eingelöst – entweder dieser Link selbst oder der Termin ist gefüllt.
  if (link.is_claimed || appointment?.status === "filled") {
    return NextResponse.json({ code: "LINK_ALREADY_CLAIMED" }, { status: 409 });
  }
  if (new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ code: "LINK_EXPIRED" }, { status: 410 });
  }

  return NextResponse.json({
    code: "LINK_AVAILABLE",
    practice_name: practice?.name ?? null,
    scheduled_time: appointment?.scheduled_time ?? null,
    expires_at: link.expires_at,
  });
}

// POST /api/fill/[slug] – ÖFFENTLICH: Termin buchen.
// WICHTIG: Es wird KEINE patient_id vom Client akzeptiert. Der Patient wird
// ausschließlich aus dem notification_link-Eintrag übernommen.
export async function POST(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const admin = createClient();

  const { data: link } = await admin
    .from("notification_links")
    .select("id, patient_id, appointment_id, is_claimed, expires_at")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ code: "LINK_NOT_FOUND" }, { status: 404 });
  }
  if (link.is_claimed) {
    return NextResponse.json({ code: "LINK_ALREADY_CLAIMED" }, { status: 409 });
  }
  if (new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ code: "LINK_EXPIRED" }, { status: 410 });
  }

  // Quelle der Wahrheit ist der Termin: nur füllen, wenn er noch nicht
  // gefüllt ist. So gewinnt der erste Klick (first-come-first-served).
  const { data: filledAppointment } = await admin
    .from("appointments")
    .update({
      status: "filled",
      filled_by_patient_id: link.patient_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", link.appointment_id)
    .neq("status", "filled")
    .select("id")
    .maybeSingle();

  if (!filledAppointment) {
    return NextResponse.json({ code: "LINK_ALREADY_CLAIMED" }, { status: 409 });
  }

  // Diesen Link als eingelöst markieren.
  await admin
    .from("notification_links")
    .update({
      is_claimed: true,
      claimed_by_patient_id: link.patient_id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  return NextResponse.json({ code: "CLAIM_SUCCESS" });
}

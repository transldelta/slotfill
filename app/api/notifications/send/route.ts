import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";

export const dynamic = "force-dynamic";

// Gültigkeitsdauer eines Benachrichtigungs-Links: 2 Stunden.
const LINK_TTL_MS = 2 * 60 * 60 * 1000;

const sendSchema = z.object({ appointment_id: z.string().uuid() });

// POST /api/notifications/send – Wartelisten-Patienten für eine Terminlücke
// benachrichtigen (erzeugt patientenspezifische Links). Der eigentliche
// WhatsApp-Versand folgt in Schritt 5.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { appointment_id } = parsed.data;

  // Termin muss zur Praxis gehören und ausgefallen ('cancelled') sein.
  const { data: appointment } = await admin
    .from("appointments")
    .select("id, status")
    .eq("id", appointment_id)
    .eq("practice_id", practiceId)
    .maybeSingle();
  if (!appointment || appointment.status !== "cancelled") {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }

  // Wartelisten-Patienten laden.
  const { data: waitlistRows } = await admin
    .from("waitlist")
    .select("patient_id")
    .eq("practice_id", practiceId);
  const patientIds = (waitlistRows ?? [])
    .map((r) => r.patient_id as string)
    .filter(Boolean);

  if (patientIds.length === 0) {
    return NextResponse.json({ code: "WAITLIST_EMPTY", count: 0, links: [] });
  }

  // Vorhandene, noch nicht eingelöste Links für diesen Termin entfernen,
  // damit ein erneutes Vorbereiten keine Duplikate erzeugt.
  await admin
    .from("notification_links")
    .delete()
    .eq("appointment_id", appointment_id)
    .eq("is_claimed", false);

  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();
  const linkRows = patientIds.map((patientId) => ({
    slug: randomUUID(),
    practice_id: practiceId,
    appointment_id,
    patient_id: patientId,
    expires_at: expiresAt,
  }));

  const { data: createdLinks, error: linkError } = await admin
    .from("notification_links")
    .insert(linkRows)
    .select("id, slug, patient_id");
  if (linkError || !createdLinks) {
    console.error("[POST /api/notifications/send] Link-Insert fehlgeschlagen:", linkError);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  // Für jeden Link einen sent_notifications-Eintrag anlegen (delivered=false).
  const notificationRows = createdLinks.map((link) => ({
    practice_id: practiceId,
    patient_id: link.patient_id,
    appointment_id,
    notification_link_id: link.id,
    delivered: false,
  }));
  const { error: notifError } = await admin
    .from("sent_notifications")
    .insert(notificationRows);
  if (notifError) {
    console.error("[POST /api/notifications/send] sent_notifications-Insert fehlgeschlagen:", notifError);
    // Links existieren bereits – wir melden trotzdem Erfolg, der Versand
    // (Schritt 5) kann auch ohne sent_notifications-Protokoll erfolgen.
  }

  return NextResponse.json({
    code: "NOTIFICATIONS_PREPARED",
    count: createdLinks.length,
    links: createdLinks.map((link) => ({
      slug: link.slug,
      patient_id: link.patient_id,
    })),
  });
}

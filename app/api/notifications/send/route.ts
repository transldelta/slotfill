import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { getTranslations } from "@/lib/i18n";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gültigkeitsdauer eines Benachrichtigungs-Links: 2 Stunden.
const LINK_TTL_MS = 2 * 60 * 60 * 1000;

const sendSchema = z.object({ appointment_id: z.string().uuid() });

type WaitlistPatient = {
  id: string;
  phone: string | null;
  whatsapp_opt_in: boolean | null;
};

// POST /api/notifications/send – Wartelisten-Patienten mit WhatsApp-Einwilligung
// für eine Terminlücke benachrichtigen (Link erzeugen + per WhatsApp senden).
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId, practiceName } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { appointment_id } = parsed.data;

  // Termin muss zur Praxis gehören und ausgefallen ('cancelled') sein.
  const { data: appointment } = await admin
    .from("appointments")
    .select("id, status, scheduled_time")
    .eq("id", appointment_id)
    .eq("practice_id", practiceId)
    .maybeSingle();
  if (!appointment || appointment.status !== "cancelled") {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }

  // Wartelisten-Patienten mit Kontaktdaten laden.
  const { data: waitlistRows } = await admin
    .from("waitlist")
    .select("patient_id, patients ( id, phone, whatsapp_opt_in )")
    .eq("practice_id", practiceId);

  const allPatients: WaitlistPatient[] = (waitlistRows ?? [])
    .map((row) => {
      const p = Array.isArray(row.patients) ? row.patients[0] : row.patients;
      return p ?? null;
    })
    .filter((p): p is WaitlistPatient => p !== null);

  if (allPatients.length === 0) {
    return NextResponse.json({ code: "WAITLIST_EMPTY", count: 0, links: [] });
  }

  // Nur Patienten mit Einwilligung UND Telefonnummer benachrichtigen.
  const recipients = allPatients.filter(
    (p) => p.whatsapp_opt_in === true && Boolean(p.phone),
  );
  if (recipients.length === 0) {
    return NextResponse.json({ code: "NO_OPTED_IN_PATIENTS", count: 0, links: [] });
  }

  // Vorhandene, noch nicht eingelöste Links für diesen Termin entfernen.
  await admin
    .from("notification_links")
    .delete()
    .eq("appointment_id", appointment_id)
    .eq("is_claimed", false);

  const expiresAt = new Date(Date.now() + LINK_TTL_MS).toISOString();
  const linkRows = recipients.map((p) => ({
    slug: randomUUID(),
    practice_id: practiceId,
    appointment_id,
    patient_id: p.id,
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

  const t = await getTranslations();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const dateText = format(new Date(appointment.scheduled_time), "dd.MM.yyyy HH:mm");
  const phoneById = new Map(recipients.map((p) => [p.id, p.phone as string]));

  // WhatsApp an jeden Empfänger senden und Zustellung protokollieren.
  let delivered = 0;
  const notificationRows = [];
  for (const link of createdLinks) {
    const phone = phoneById.get(link.patient_id);
    const messageBody = t("notification.messageTemplate", {
      practice: practiceName,
      date: dateText,
      link: `${appUrl}/fill/${link.slug}`,
    });

    let ok = false;
    if (phone) {
      const result = await sendWhatsApp(phone, messageBody);
      ok = Boolean(result.sid);
      if (ok) delivered += 1;
    }

    notificationRows.push({
      practice_id: practiceId,
      patient_id: link.patient_id,
      appointment_id,
      notification_link_id: link.id,
      delivered: ok,
    });
  }

  const { error: notifError } = await admin
    .from("sent_notifications")
    .insert(notificationRows);
  if (notifError) {
    console.error("[POST /api/notifications/send] sent_notifications-Insert fehlgeschlagen:", notifError);
  }

  return NextResponse.json({
    code: "NOTIFICATIONS_PREPARED",
    count: createdLinks.length,
    delivered,
    links: createdLinks.map((link) => ({
      slug: link.slug,
      patient_id: link.patient_id,
    })),
  });
}

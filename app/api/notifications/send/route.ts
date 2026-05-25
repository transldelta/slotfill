import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { formatBerlin } from "@/lib/datetime";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { getTranslations } from "@/lib/i18n";
import { sendAppointmentOfferMessage } from "@/lib/messaging";
import {
  checkNotificationLimit,
  incrementNotificationCount,
} from "@/lib/subscription";

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

  // Monatliches Limit prüfen (vor dem Versand).
  let limit;
  try {
    limit = await checkNotificationLimit(practiceId);
  } catch (err) {
    if (err instanceof Error && err.message === "LIMIT_REACHED") {
      return NextResponse.json({ code: "LIMIT_REACHED" }, { status: 402 });
    }
    console.error("[POST /api/notifications/send] Limit-Prüfung fehlgeschlagen:", err);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
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

  // Zähler über alle möglichen Status (für die Antwort).
  const counts: Record<string, number> = {
    sent: 0,
    prepared: 0,
    dry_run: 0,
    failed: 0,
    skipped_no_provider: 0,
    skipped_no_consent: 0,
    skipped_invalid_phone: 0,
    skipped_whatsapp_template_missing: 0,
  };

  // Nur Patienten mit Einwilligung UND Telefonnummer benachrichtigen.
  // Fehlende Einwilligung wird sauber gezählt (keine Nachricht, kein Link).
  const recipients = allPatients.filter(
    (p) => p.whatsapp_opt_in === true && Boolean(p.phone),
  );
  counts.skipped_no_consent = allPatients.filter(
    (p) => p.whatsapp_opt_in !== true,
  ).length;

  if (recipients.length === 0) {
    return NextResponse.json({
      code: "NO_OPTED_IN_PATIENTS",
      count: 0,
      links: [],
      counts,
    });
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
  const dateText = formatBerlin(appointment.scheduled_time);
  const phoneById = new Map(recipients.map((p) => [p.id, p.phone as string]));

  // Über die zentrale Nachrichten-Schicht senden und Status protokollieren.
  let delivered = 0;
  counts.prepared = createdLinks.length;
  const notificationRows = [];
  for (const link of createdLinks) {
    const phone = phoneById.get(link.patient_id);
    const messageBody = t("notification.messageTemplate", {
      practice: practiceName,
      date: dateText,
      link: `${appUrl}/fill/${link.slug}`,
    });

    const result = await sendAppointmentOfferMessage({ to: phone, body: messageBody });
    const ok = result.status === "sent";
    if (ok) delivered += 1;
    counts[result.status] = (counts[result.status] ?? 0) + 1;

    notificationRows.push({
      practice_id: practiceId,
      patient_id: link.patient_id,
      appointment_id,
      notification_link_id: link.id,
      delivered: ok,
      status: result.status,
    });
  }

  const { error: notifError } = await admin
    .from("sent_notifications")
    .insert(notificationRows);
  if (notifError) {
    console.error("[POST /api/notifications/send] sent_notifications-Insert fehlgeschlagen:", notifError);
  }

  // Nur tatsächlich versendete Nachrichten auf das Limit anrechnen.
  await incrementNotificationCount(practiceId, delivered);
  const remaining = limit.maxNotifications - (limit.usedNotifications + delivered);

  return NextResponse.json({
    code: "NOTIFICATIONS_PREPARED",
    count: createdLinks.length,
    delivered,
    remaining,
    counts,
    links: createdLinks.map((link) => ({
      slug: link.slug,
      patient_id: link.patient_id,
    })),
  });
}

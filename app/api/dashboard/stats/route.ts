import { NextResponse } from "next/server";
import { getCurrentPractice } from "@/lib/practice";
import { toPatientName } from "@/lib/patients";

export const dynamic = "force-dynamic";

const DEFAULT_APPOINTMENT_VALUE = 100;

type Activity = {
  type: "appointment" | "patient";
  id: string;
  timestamp: string;
  status: string | null;
  patientName: string | null;
};

// GET /api/dashboard/stats – echte Kennzahlen der aktuellen Praxis.
export async function GET() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  try {
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPatientsRes,
      waitlistRes,
      appointmentsTodayRes,
      filledTodayRes,
      filledTotalRes,
    ] = await Promise.all([
      admin
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("practice_id", practiceId),
      admin
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .eq("practice_id", practiceId),
      admin
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("practice_id", practiceId)
        .gte("scheduled_time", todayStart.toISOString())
        .lt("scheduled_time", tomorrowStart.toISOString()),
      admin
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("practice_id", practiceId)
        .eq("status", "filled")
        .gte("updated_at", todayStart.toISOString()),
      admin
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("practice_id", practiceId)
        .eq("status", "filled"),
    ]);

    const totalPatients = totalPatientsRes.count ?? 0;
    const waitlistCount = waitlistRes.count ?? 0;
    const appointmentsToday = appointmentsTodayRes.count ?? 0;
    const filledToday = filledTodayRes.count ?? 0;
    const filledTotal = filledTotalRes.count ?? 0;

    // Verbrauchte Benachrichtigungen aus der Subscription.
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("notifications_used_this_month")
      .eq("practice_id", practiceId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const notificationsThisMonth =
      subscription?.notifications_used_this_month ?? 0;

    // Durchschnittlicher Terminwert – Spalte ggf. nicht vorhanden -> Fallback.
    let avgValue = DEFAULT_APPOINTMENT_VALUE;
    const practiceValue = await admin
      .from("practices")
      .select("avg_appointment_value")
      .eq("id", practiceId)
      .maybeSingle();
    const rawValue = practiceValue.data as
      | { avg_appointment_value?: number | null }
      | null;
    if (rawValue && typeof rawValue.avg_appointment_value === "number") {
      avgValue = rawValue.avg_appointment_value;
    }
    const revenueSaved = filledTotal * avgValue;

    // Letzte Aktivitäten (Termine + Patienten der letzten 7 Tage).
    const [recentAppointments, recentPatients] = await Promise.all([
      admin
        .from("appointments")
        .select("id, status, patient_id, created_at")
        .eq("practice_id", practiceId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("patients")
        .select("id, first_name, last_name, created_at")
        .eq("practice_id", practiceId)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Patientennamen für Termin-Aktivitäten nachladen.
    const apptPatientIds = Array.from(
      new Set(
        (recentAppointments.data ?? [])
          .map((a) => a.patient_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const names = new Map<string, string>();
    if (apptPatientIds.length > 0) {
      const { data: namedPatients } = await admin
        .from("patients")
        .select("id, first_name, last_name")
        .in("id", apptPatientIds);
      for (const p of namedPatients ?? []) {
        names.set(p.id, toPatientName(p.first_name, p.last_name));
      }
    }

    const activity: Activity[] = [
      ...(recentAppointments.data ?? []).map((a) => ({
        type: "appointment" as const,
        id: a.id as string,
        timestamp: a.created_at as string,
        status: (a.status as string) ?? null,
        patientName: a.patient_id ? (names.get(a.patient_id) ?? null) : null,
      })),
      ...(recentPatients.data ?? []).map((p) => ({
        type: "patient" as const,
        id: p.id as string,
        timestamp: p.created_at as string,
        status: null,
        patientName: toPatientName(p.first_name, p.last_name),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    return NextResponse.json({
      code: "STATS_LOADED",
      stats: {
        practiceName: ctx.practiceName,
        totalPatients,
        waitlistCount,
        appointmentsToday,
        filledToday,
        notificationsThisMonth,
        revenueSaved,
        recentActivity: activity,
      },
    });
  } catch (err) {
    console.error("[GET /api/dashboard/stats] Fehler:", err);
    return NextResponse.json({ code: "STATS_ERROR" }, { status: 500 });
  }
}

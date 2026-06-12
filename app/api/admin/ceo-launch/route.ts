/**
 * GET /api/admin/ceo-launch
 *
 * CEO Launch Operations Overview.
 * Nur für Admins. READ-ONLY. Keine automatische Kommunikation.
 * Keine Secrets in der Antwort.
 *
 * Liefert:
 * - Launch-Status (Links, Lead-Zahlen)
 * - 8 Abteilungs-Zuweisungen
 * - Outreach-Vorbereitungstexte (nur Vorlagen – kein Auto-Versand)
 * - Daily CEO Briefing (max. 3 Aufgaben)
 * - Letzte echte Leads (für Lead-Handling)
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { CANONICAL_URL } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Typen ────────────────────────────────────────────────────────────────────

type DeptStatus = "ready" | "needs_review" | "blocked";
type Priority = "high" | "medium" | "low";

type Department = {
  id: string;
  name: string;
  status: DeptStatus;
  next_task: string;
  reason: string;
  priority: Priority;
  needs_approval: boolean;
};

type OutreachText = {
  id: string;
  label: string;
  lang: "de" | "en";
  text: string;
};

type DailyTask = {
  order: number;
  task: string;
  link: string | null;
  section: string;
};

type RecentLead = {
  type: "contact" | "booking";
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  status: string | null;
  note: string | null;
};

// ─── CEO Secretary Briefing ───────────────────────────────────────────────────

type SecretaryBriefing = {
  generated_at: string;
  // Ampel
  overall_signal: "green" | "yellow" | "red";
  // 5 Zeilen Summary
  today_highlight: string;
  new_real_leads: number;
  new_real_bookings: number;
  qa_summary: string;
  recommended_action: string;
  // Betriebsstatus (keine Secrets – nur Klassifikation)
  stripe_status: "not_live" | "test" | "live";
  env_status: "ok" | "partial" | "missing";
  legal_status: "draft" | "approved";
  // E-Mail-Briefing: standardmäßig deaktiviert
  // Aktivierung via CEO_DAILY_BRIEF_EMAIL_ENABLED=true (noch nicht gebaut)
  daily_brief_email_enabled: false;
};

type LaunchOverview = {
  code: "CEO_LAUNCH_READY";
  generated_at: string;

  // CEO Secretary Briefing (immer oben)
  secretary_briefing: SecretaryBriefing;

  // A. Launch-Status
  launch_live: boolean;
  canonical_url: string;
  launch_de: string;
  launch_en: string;
  share_de: string;
  share_en: string;
  public_launch_de: string;
  public_launch_en: string;
  booking_demo: string;
  sitemap_url: string;

  // Lead-Zahlen
  real_contacts: number;
  test_contacts: number;
  real_bookings: number;
  test_bookings: number;
  last_real_contact_at: string | null;
  last_real_booking_at: string | null;

  // B. Abteilungen
  departments: Department[];

  // E. Outreach-Texte (nur Vorlagen, kein Auto-Versand)
  outreach_texts: OutreachText[];

  // F. Lead Handling – letzte echte Leads
  recent_leads: RecentLead[];

  // H. Daily CEO Briefing (max. 3 Aufgaben)
  daily_tasks: DailyTask[];
};

// ─── CEO Secretary: Betriebs-Briefing ────────────────────────────────────────
// Läuft server-seitig. Keine Secrets in der Antwort – nur Klassifikationen.
// E-Mail-Briefing: CEO_DAILY_BRIEF_EMAIL_ENABLED – aktuell immer false.

function buildSecretaryBriefing(
  realContacts: number,
  realBookings: number,
): SecretaryBriefing {
  const totalLeads = realContacts + realBookings;
  const hasLeads = totalLeads > 0;

  // Stripe-Status: Key-Präfix lesen, Wert NICHT zurückgeben
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const stripeStatus: SecretaryBriefing["stripe_status"] = stripeKey.startsWith(
    "sk_live_",
  )
    ? "live"
    : stripeKey.startsWith("sk_test_")
      ? "test"
      : "not_live";

  // ENV-Status: nur Präsenz kritischer Keys prüfen, keine Werte zurückgeben
  const criticalEnvKeys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_APP_URL",
  ] as const;
  const presentCount = criticalEnvKeys.filter((k) =>
    Boolean(process.env[k]),
  ).length;
  const envStatus: SecretaryBriefing["env_status"] =
    presentCount === criticalEnvKeys.length
      ? "ok"
      : presentCount > 0
        ? "partial"
        : "missing";

  // Legal-Status: LEGAL_REVIEW_APPROVED env-Var
  const legalStatus: SecretaryBriefing["legal_status"] =
    process.env.LEGAL_REVIEW_APPROVED === "true" ? "approved" : "draft";

  // ── Ampel ────────────────────────────────────────────────────────────────
  let overallSignal: SecretaryBriefing["overall_signal"] = "green";
  if (envStatus === "missing") {
    overallSignal = "red";
  } else if (
    hasLeads ||
    envStatus === "partial" ||
    legalStatus === "draft" ||
    stripeStatus === "not_live"
  ) {
    overallSignal = "yellow";
  }

  // ── Empfohlene Aktion ─────────────────────────────────────────────────────
  let recommendedAction: string;
  if (envStatus === "missing") {
    recommendedAction = "Technik prüfen – keine externe Kommunikation.";
  } else if (hasLeads) {
    recommendedAction = "Antwort vorbereiten – Freigabe erforderlich.";
  } else {
    recommendedAction = "Nichts tun – weiter beobachten.";
  }

  // ── Heutiger Highlight ────────────────────────────────────────────────────
  let todayHighlight: string;
  if (hasLeads) {
    todayHighlight = `${totalLeads} neue echte Anfrage(n) eingegangen.`;
  } else if (stripeStatus === "not_live") {
    todayHighlight = "Stripe noch nicht live – Testmodus aktiv.";
  } else if (legalStatus === "draft") {
    todayHighlight = "Rechtstexte im Entwurf-Modus – Anwaltsprüfung ausstehend.";
  } else {
    todayHighlight = "Keine besonderen Vorkommnisse. System läuft stabil.";
  }

  // ── QA-Zusammenfassung (Echtzeit-QA läuft nur auf Knopfdruck) ─────────────
  const qaSummary =
    "QA-Check on demand – Button in Abschnitt B verfügbar. Letzter Stand unbekannt.";

  return {
    generated_at: new Date().toISOString(),
    overall_signal: overallSignal,
    today_highlight: todayHighlight,
    new_real_leads: realContacts,
    new_real_bookings: realBookings,
    qa_summary: qaSummary,
    recommended_action: recommendedAction,
    stripe_status: stripeStatus,
    env_status: envStatus,
    legal_status: legalStatus,
    daily_brief_email_enabled: false,
  };
}

// ─── Statische Konfiguration ──────────────────────────────────────────────────

const LAUNCH_LINKS = {
  canonical_url: CANONICAL_URL,
  launch_de: `${CANONICAL_URL}/de/launch`,
  launch_en: `${CANONICAL_URL}/en/launch`,
  share_de: `${CANONICAL_URL}/de/share`,
  share_en: `${CANONICAL_URL}/en/share`,
  public_launch_de: `${CANONICAL_URL}/de/public-launch`,
  public_launch_en: `${CANONICAL_URL}/en/public-launch`,
  booking_demo: `${CANONICAL_URL}/book/testpraxis-delta`,
  sitemap_url: `${CANONICAL_URL}/sitemap.xml`,
};

// ─── Abteilungs-Zuweisungen ───────────────────────────────────────────────────

function buildDepartments(
  realContacts: number,
  realBookings: number,
): Department[] {
  const hasRealLeads = realContacts + realBookings > 0;

  return [
    {
      id: "ceo_secretary",
      name: "CEO Secretary",
      status: hasRealLeads ? "needs_review" : "ready",
      next_task: hasRealLeads
        ? "Briefing lesen – echte Anfragen eingegangen, Antwort vorbereiten"
        : "Tägliches Briefing prüfen – kein Handlungsbedarf heute",
      reason:
        "Fasst den gesamten Betriebsstatus zusammen. Zeigt täglich die wichtigste Aktion. Kein Auto-Versand.",
      priority: hasRealLeads ? "high" : "low",
      needs_approval: false,
    },
    {
      id: "ceo_control",
      name: "CEO Control",
      status: "ready",
      next_task: "Tägliches Briefing lesen, max. 3 Aufgaben prüfen und freigeben",
      reason:
        "Der Betreiber prüft und gibt frei. Das System arbeitet vor – der CEO entscheidet.",
      priority: "high",
      needs_approval: true,
    },
    {
      id: "product_qa",
      name: "Product QA",
      status: "ready",
      next_task:
        "QA-Check ausführen (Button unten): Alle Launch-Seiten auf 200 OK prüfen",
      reason:
        "Sicherstellt, dass alle öffentlichen Seiten erreichbar und fehlerfrei sind.",
      priority: "high",
      needs_approval: false,
    },
    {
      id: "seo_indexing",
      name: "SEO & Indexing",
      status: "ready",
      next_task:
        "Google & Bing Sitemap erfolgreich eingereicht (✓ erledigt) – periodisch Indexierungs-Status in Google Search Console prüfen",
      reason:
        "Google Sitemap erkannt: 160 URLs eingereicht. Bing Sitemap verarbeitet. Kein weiterer Setup-Schritt notwendig.",
      priority: "low",
      needs_approval: false,
    },
    {
      id: "website_launch",
      name: "Website Launch",
      status: "ready",
      next_task:
        "Launch-Seite DE/EN aufrufen und optisch prüfen (5 Minuten)",
      reason:
        "Stellt sicher, dass der neue Buchungslink-Text sichtbar und korrekt ist.",
      priority: "high",
      needs_approval: false,
    },
    {
      id: "outreach_prep",
      name: "Outreach Preparation",
      status: "ready",
      next_task:
        "Vorbereiteten Kurztext prüfen und nur bei passendem persönlichen Kontakt manuell freigeben",
      reason:
        "Kein Auto-Versand. Kein Pflicht-Versand. Jeder Text wird nur weitergeleitet, wenn der Betreiber es für sinnvoll hält.",
      priority: "medium",
      needs_approval: true,
    },
    {
      id: "lead_handling",
      name: "Lead Handling",
      status: hasRealLeads ? "needs_review" : "ready",
      next_task: hasRealLeads
        ? `${realContacts + realBookings} echte Anfrage(n) eingegangen – Antwortvorlage prüfen und manuell antworten`
        : "Noch keine echten Leads. Sobald Anfragen eingehen, hier anzeigen.",
      reason:
        "Echte Anfragen zuerst bearbeiten. Antwortvorlagen sind vorbereitet – nur noch senden.",
      priority: hasRealLeads ? "high" : "low",
      needs_approval: true,
    },
    {
      id: "compliance_trust",
      name: "Compliance & Trust",
      status: "ready",
      next_task:
        "Compliance-Checkliste einmalig durchsehen (keine Fake-Zahlen, keine Garantien)",
      reason:
        "Schützt vor Fehlinformationen und sorgt für ein ehrliches öffentliches Auftreten.",
      priority: "low",
      needs_approval: false,
    },
    {
      id: "analytics_reporting",
      name: "Analytics / Reporting",
      status: "needs_review",
      next_task:
        "Google Analytics optional einrichten (Privacy-First: ohne Tracking-Cookie oder Plausible.io als Alternative)",
      reason:
        "Ohne Analytics keine Besucherdaten. Ist optional – kein Launch-Blocker.",
      priority: "low",
      needs_approval: true,
    },
  ];
}

// ─── Outreach-Texte ───────────────────────────────────────────────────────────
// NUR VORLAGEN. Kein Auto-Versand. Betreiber-Freigabe erforderlich.

const OUTREACH_TEXTS: OutreachText[] = [
  {
    id: "de_short_1",
    label: "DE Kurztext 1 (Social / persönlich)",
    lang: "de",
    text: "Ich habe ClinicSlotHub gestartet – jede Praxis bekommt einen eigenen öffentlichen Buchungslink. Patienten stellen Anfragen ohne Login, die Praxis bestätigt im Dashboard. 14 Tage kostenlos: clinicslothub.com",
  },
  {
    id: "de_short_2",
    label: "DE Kurztext 2 (kurz, direkt)",
    lang: "de",
    text: "Terminanfragen digital empfangen ohne Telefonliste – das ist ClinicSlotHub. Eigener Buchungslink pro Praxis. Kostenlos testen: clinicslothub.com",
  },
  {
    id: "de_short_3",
    label: "DE Kurztext 3 (Nutzen-fokussiert)",
    lang: "de",
    text: "Praxen, die Terminlücken reduzieren wollen: ClinicSlotHub gibt jeder Praxis einen teilbaren Buchungslink. Kein Patienten-Login. 14 Tage gratis. → clinicslothub.com",
  },
  {
    id: "de_short_4",
    label: "DE Kurztext 4 (WhatsApp / Signal)",
    lang: "de",
    text: "Hey – ich habe ein kleines Praxis-Tool gestartet, das Terminanfragen digital empfängt. Falls du jemanden kennst, der sowas braucht: clinicslothub.com – kostenloser Test, keine Kreditkarte.",
  },
  {
    id: "de_short_5",
    label: "DE Kurztext 5 (Community / Forum)",
    lang: "de",
    text: "[Eigenprojekt] Digitale Buchungsanfragen für Arzt- & Therapiepraxen – öffentlicher Soft Launch. Jede Praxis bekommt einen eigenen Link. Stack: Next.js, Supabase, Vercel. Feedback willkommen: clinicslothub.com",
  },
  {
    id: "en_short_1",
    label: "EN Short text 1 (social / personal)",
    lang: "en",
    text: "I launched ClinicSlotHub – every practice gets its own public booking link. Patients request appointments without creating an account, the practice confirms in the dashboard. 14-day free trial: clinicslothub.com",
  },
  {
    id: "en_short_2",
    label: "EN Short text 2 (brief, direct)",
    lang: "en",
    text: "Receive appointment requests digitally without a phone list – that's ClinicSlotHub. Each practice gets its own booking link. Try it free: clinicslothub.com",
  },
  {
    id: "en_short_3",
    label: "EN Short text 3 (benefit-focused)",
    lang: "en",
    text: "For practices that want to reduce appointment gaps: ClinicSlotHub gives each practice a shareable booking link. No patient login. 14 days free. → clinicslothub.com",
  },
  {
    id: "en_short_4",
    label: "EN Short text 4 (WhatsApp / Signal)",
    lang: "en",
    text: "Hey – I launched a small practice tool that receives appointment requests digitally. If you know anyone who needs this: clinicslothub.com – free trial, no credit card.",
  },
  {
    id: "en_short_5",
    label: "EN Short text 5 (community / forum)",
    lang: "en",
    text: "[My project] Digital appointment requests for medical & therapy practices – public soft launch. Each practice gets its own booking link. Stack: Next.js, Supabase, Vercel. Feedback welcome: clinicslothub.com",
  },
  {
    id: "de_email",
    label: "DE E-Mail-Text (persönliche Weiterleitung)",
    lang: "de",
    text: `Betreff: ClinicSlotHub – digitale Terminanfragen für Praxen

Hallo,

ich möchte dir kurz ClinicSlotHub vorstellen – eine neue SaaS-Plattform für Arzt- und Therapiepraxen.

Der Kernnutzen: Jede Praxis bekommt einen eigenen öffentlichen Buchungslink – teilbar per Website, E-Mail oder QR-Code. Patienten stellen darüber eine Anfrage ohne Login. Die Praxis bestätigt oder lehnt im Dashboard ab.

Status: öffentlicher Soft Launch. Keine zahlenden Kunden. Keine übertriebenen Versprechen. Ein funktionierendes Produkt, das getestet werden soll.

14 Tage kostenlos, keine Kreditkarte: clinicslothub.com

Fragen? transl.delta@gmail.com

Viele Grüße`,
  },
  {
    id: "en_email",
    label: "EN Email text (personal forwarding)",
    lang: "en",
    text: `Subject: ClinicSlotHub – digital appointment requests for practices

Hi,

I'd like to introduce you to ClinicSlotHub — a new SaaS platform for medical and therapy practices.

The core: every practice gets its own public booking link — shareable via website, email or QR code. Patients submit a request without creating an account. The practice confirms or rejects in the dashboard.

Status: public soft launch. No paying customers. No exaggerated claims. A working product ready for testing.

14-day free trial, no credit card: clinicslothub.com

Questions? transl.delta@gmail.com

Best regards`,
  },
];

// ─── Daily CEO Briefing (max. 3 Aufgaben) ────────────────────────────────────

function buildDailyTasks(
  realContacts: number,
  realBookings: number,
): DailyTask[] {
  const tasks: DailyTask[] = [];
  const totalLeads = realContacts + realBookings;

  // Aufgabe 1: Immer – Launch-Seite prüfen
  tasks.push({
    order: 1,
    task: "Launch-Seite DE öffnen und optisch prüfen (5 Min.)",
    link: `${CANONICAL_URL}/de/launch`,
    section: "website_launch",
  });

  // Aufgabe 2: Leads prüfen ODER Outreach-Text prüfen (kein Pflicht-Versand)
  if (totalLeads > 0) {
    tasks.push({
      order: 2,
      task: `${totalLeads} echte Anfrage(n) eingegangen – jetzt prüfen und Antwortvorlage kopieren`,
      link: "/admin/ceo-launch#lead-handling",
      section: "lead_handling",
    });
  } else {
    tasks.push({
      order: 2,
      task: "Vorbereiteten Outreach-Text prüfen – nur bei passendem persönlichen Kontakt manuell freigeben",
      link: "/admin/ceo-launch#outreach",
      section: "outreach_prep",
    });
  }

  // Aufgabe 3: Immer Product QA-Check (Google/Bing-Setup ist erledigt)
  tasks.push({
    order: 3,
    task: "Product QA-Check ausführen: alle Launch-Seiten live prüfen (Button auf dieser Seite)",
    link: "/admin/ceo-launch#qa",
    section: "product_qa",
  });

  return tasks.slice(0, 3); // Niemals mehr als 3
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin } = ctx;

  // Lead-Statistiken aus DB
  const [
    realContactsRes,
    testContactsRes,
    realBookingsRes,
    testBookingsRes,
    lastContactRes,
    lastBookingRes,
    recentContactsRes,
    recentBookingsRes,
  ] = await Promise.all([
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .or("is_test.is.null,is_test.eq.false"),
    admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_test", true),
    admin
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .or("is_test.is.null,is_test.eq.false"),
    admin
      .from("booking_requests")
      .select("*", { count: "exact", head: true })
      .eq("is_test", true),
    admin
      .from("contact_messages")
      .select("created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("booking_requests")
      .select("created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Letzte 5 echte Kontaktanfragen
    admin
      .from("contact_messages")
      .select("id, name, email, message, status, created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(5),
    // Letzte 5 echte Buchungsanfragen
    admin
      .from("booking_requests")
      .select("id, patient_name, patient_email, notes, status, created_at")
      .or("is_test.is.null,is_test.eq.false")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const realContacts = realContactsRes.count ?? 0;
  const testContacts = testContactsRes.count ?? 0;
  const realBookings = realBookingsRes.count ?? 0;
  const testBookings = testBookingsRes.count ?? 0;
  const lastRealContactAt =
    (lastContactRes.data as { created_at: string } | null)?.created_at ?? null;
  const lastRealBookingAt =
    (lastBookingRes.data as { created_at: string } | null)?.created_at ?? null;

  // Letzte echte Leads zusammenführen
  type ContactRow = { id: string; name: string | null; email: string | null; message: string | null; status: string | null; created_at: string };
  type BookingRow = { id: string; patient_name: string | null; patient_email: string | null; notes: string | null; status: string | null; created_at: string };

  const contacts = ((recentContactsRes.data ?? []) as ContactRow[]).map(
    (c): RecentLead => ({
      type: "contact",
      id: c.id,
      name: c.name,
      email: c.email,
      created_at: c.created_at,
      status: c.status,
      note: c.message ? c.message.slice(0, 100) : null,
    }),
  );
  const bookings = ((recentBookingsRes.data ?? []) as BookingRow[]).map(
    (b): RecentLead => ({
      type: "booking",
      id: b.id,
      name: b.patient_name,
      email: b.patient_email,
      created_at: b.created_at,
      status: b.status,
      note: b.notes ? b.notes.slice(0, 100) : null,
    }),
  );
  const recentLeads: RecentLead[] = [...contacts, ...bookings]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const payload: LaunchOverview = {
    code: "CEO_LAUNCH_READY",
    generated_at: new Date().toISOString(),

    secretary_briefing: buildSecretaryBriefing(realContacts, realBookings),

    launch_live: true,
    ...LAUNCH_LINKS,

    real_contacts: realContacts,
    test_contacts: testContacts,
    real_bookings: realBookings,
    test_bookings: testBookings,
    last_real_contact_at: lastRealContactAt,
    last_real_booking_at: lastRealBookingAt,

    departments: buildDepartments(realContacts, realBookings),
    outreach_texts: OUTREACH_TEXTS,
    recent_leads: recentLeads,
    daily_tasks: buildDailyTasks(realContacts, realBookings),
  };

  return NextResponse.json(payload);
}

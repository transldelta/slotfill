/**
 * Public Positioning Guards.
 *
 * ClinicSlotHub ist die öffentliche Marke für eine einfache Patienten-Terminbuchung
 * (per CEO-Entscheid von der früheren öffentlichen Marke "Slotfill" vereinheitlicht).
 * Diese Guards stellen sicher, dass die abgelehnte Board-/OS-/Visibility-Richtung
 * öffentlich nicht zurückkehrt, die öffentliche Marke "ClinicSlotHub" ist, die
 * Buchungsroute existiert und keine medizinischen/Trial-/Automatisierungs-Versprechen
 * erscheinen.
 *
 * Lauf: tsx --test scripts/slotfill-positioning.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_BRAND_NAME } from "../lib/brand";
import { locales, RETIRED_LOCALES } from "../i18n/routing";
import { getMarketScope } from "../lib/market-scope";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
const landingBlob = (loc: string) => JSON.stringify(msg(loc).landing ?? {}).toLowerCase();

const PAGE = "app/[locale]/page.tsx";
const LAYOUT = "app/[locale]/layout.tsx";
const LOGO = "components/ui/SlotFillLogo.tsx";

// ─── 1. Public Brand Guard ────────────────────────────────────────────────────

test("Public Brand Guard: öffentliche Marke ist ClinicSlotHub (CEO-Vereinheitlichung)", () => {
  assert.equal(PUBLIC_BRAND_NAME, "ClinicSlotHub", `PUBLIC_BRAND_NAME soll 'ClinicSlotHub' sein, ist: ${PUBLIC_BRAND_NAME}`);
  // Wordmark/Logo nutzt die öffentliche Marke aus der Einzelquelle.
  assert.ok(read(LOGO).includes("PUBLIC_BRAND_NAME"), "Logo nutzt PUBLIC_BRAND_NAME nicht");
  // nav.brand ist in allen aktiven Locales ClinicSlotHub – kein altes 'Slotfill' mehr.
  for (const loc of locales) {
    assert.equal(msg(loc).nav?.brand, "ClinicSlotHub", `${loc}: nav.brand ist nicht 'ClinicSlotHub'`);
  }
  // Kein sichtbares Alt-Branding 'Slotfill' in öffentlicher Landing-Copy.
  for (const loc of locales) {
    assert.equal(landingBlob(loc).includes("slotfill"), false, `${loc}: altes 'Slotfill' in Landing-Copy`);
  }
  // Keine abgelehnte Hauptpositionierung öffentlich.
  for (const f of [PAGE, LAYOUT]) {
    const src = read(f);
    for (const bad of ["Modern Clinic Scheduling OS", "Visibility Engine"]) {
      assert.equal(src.includes(bad), false, `${f}: abgelehnte Positionierung "${bad}"`);
    }
  }
  for (const loc of locales) {
    assert.equal(landingBlob(loc).includes("modern clinic scheduling os"), false, `${loc}: Scheduling-OS in Landing-Copy`);
  }
});

// ─── 2. Patient Booking Positioning Guard ─────────────────────────────────────

test("Patient Booking Positioning Guard: Slotfill = Online-Terminbuchung", () => {
  const en = msg("en");
  assert.ok(en.landing.heroTitle.toLowerCase().includes("book doctor appointments online"), "EN heroTitle fehlt Patienten-Buchungsbotschaft");
  assert.ok(en.landing.ctaPrimary.toLowerCase().includes("book appointment"), "EN ctaPrimary ist nicht 'Book appointment'");
  assert.ok((en.nav.bookAppointment || "").toLowerCase().includes("book appointment"), "nav.bookAppointment fehlt");
  // Anfragelogik (kein Garantie-/Auto-Versprechen): Online-Booking-Sektion spricht von Anfrage + Bestätigung durch die Klinik.
  const b = landingBlob("en");
  assert.ok(b.includes("appointment request") || b.includes("appointment requests"), "EN Landing erwähnt keine appointment request");
  assert.ok(b.includes("confirm") || b.includes("available"), "EN Landing erwähnt keine Verfügbarkeit/Bestätigung");
});

// ─── 3. Booking Route Guard ───────────────────────────────────────────────────

test("Booking Route Guard: /book/[slug] + /termin-buchen vorhanden und verlinkt", () => {
  assert.ok(existsSync(join(ROOT, "app/book/[slug]/page.tsx")), "Buchungsroute /book/[slug] fehlt");
  assert.ok(existsSync(join(ROOT, "app/[locale]/termin-buchen/page.tsx")), "/termin-buchen fehlt");
  const home = read(PAGE);
  assert.ok(home.includes("/termin-buchen"), "Homepage verlinkt die Buchungsroute /termin-buchen nicht");
  assert.ok(home.includes("/book/testpraxis-delta"), "Homepage verlinkt die Demo-Praxis /book/testpraxis-delta nicht");
});

// ─── 4. No Old Pivot Guard ────────────────────────────────────────────────────

test("No Old Pivot Guard: keine Scheduling-OS-/Board-/Visibility-/Emerging-Reste öffentlich", () => {
  const forbidden = [
    "one board for today",
    "run the clinic day",
    "today board",
    "walk-in queue",
    "open slots",
    "how clinicslothub makes money",
    "modern clinic scheduling os",
    "interactive board",
    "visibility engine",
    "treatment areas",
    "medical tourism",
    "emerging markets",
    "soft launch",
    "try for free",
    "14-day free trial",
    "fill appointment slots automatically",
    "try free for 14 days",
    "sms/whatsapp optional via twilio",
  ];
  const srcs = [read(PAGE).toLowerCase(), read(LAYOUT).toLowerCase(), ...locales.map(landingBlob)];
  for (const s of srcs) {
    for (const bad of forbidden) {
      assert.equal(s.includes(bad), false, `Alt-Pivot-Text öffentlich gefunden: "${bad}"`);
    }
  }
});

// ─── 7. Allowed Locale Guard ──────────────────────────────────────────────────

test("Allowed Locale Guard: nur EN/DE/FR/ES/PT aktiv, stillgelegte → 308 /en", () => {
  assert.deepEqual([...locales].slice().sort(), ["de", "en", "es", "fr", "pt"]);
  for (const r of RETIRED_LOCALES) {
    assert.equal((locales as readonly string[]).includes(r), false, `stillgelegte Locale noch aktiv: ${r}`);
  }
  const mw = read("middleware.ts");
  assert.ok(mw.includes("RETIRED_LOCALES"), "Middleware kennt RETIRED_LOCALES nicht");
  assert.ok(/status:\s*308/.test(mw) && mw.includes('"/en"'), "Middleware leitet stillgelegte Locales nicht per 308 auf /en");
});

// ─── 8. Language Switcher Guard ───────────────────────────────────────────────

test("Language Switcher Guard: zeigt nur die 5 aktiven Sprachen", () => {
  const src = read("components/language-switcher.tsx");
  for (const name of ["Deutsch", "English", "Français", "Español", "Português"]) {
    assert.ok(src.includes(name), `Sprache fehlt im Switcher: ${name}`);
  }
  for (const gone of ["中文", "हिन्दी", "العربية", "বাংলা", "Русский"]) {
    assert.equal(src.includes(gone), false, `stillgelegte Sprache noch im Switcher: ${gone}`);
  }
});

// ─── 9. Sitemap Locale Guard ──────────────────────────────────────────────────

test("Sitemap Locale Guard: Sitemap nutzt nur die aktiven Locales", () => {
  const sm = read("app/sitemap.ts");
  assert.ok(sm.includes("locales"), "Sitemap nutzt routing.locales nicht");
  for (const r of ["ar", "hi", "bn", "ru", "zh"]) {
    assert.equal(new RegExp(`["'/]${r}["'/]`).test(sm), false, `Sitemap hardcodet stillgelegte Locale: ${r}`);
  }
});

// ─── 10. Copy Quality Guard ───────────────────────────────────────────────────

test("Copy Quality Guard: keine Platzhalter/TODO, zentrale CTAs gefüllt, FR/ES/PT/DE eigenständig", () => {
  for (const loc of locales) {
    const m = msg(loc);
    const blob = landingBlob(loc);
    for (const ph of ["lorem ipsum", "coming soon"]) {
      assert.equal(blob.includes(ph), false, `${loc}: Platzhalter "${ph}"`);
    }
    assert.equal(/\bTODO\b/.test(JSON.stringify(m.landing ?? {})), false, `${loc}: TODO-Marker`);
    for (const k of ["heroTitle", "ctaPrimary", "ctaSecondary"]) {
      assert.ok((m.landing?.[k] ?? "").trim().length > 2, `${loc}: landing.${k} leer/zu kurz`);
    }
  }
  // Eigenständige Hero-Übersetzung (keine reine EN-Kopie).
  const en = msg("en").landing.heroTitle;
  for (const loc of ["de", "fr", "es", "pt"]) {
    assert.notEqual(msg(loc).landing.heroTitle, en, `${loc}: heroTitle identisch mit EN`);
  }
});

// ─── 11. Duplicate Logic Guard ────────────────────────────────────────────────

test("Duplicate Logic Guard: ein Produkt, eine Haupt-H1, keine Board+Booking-Mischung", () => {
  const raw = read(PAGE);
  const h1 = (raw.match(/<h1[\s>]/g) ?? []).length;
  assert.ok(h1 <= 1, `mehr als eine <h1> auf der Homepage (${h1})`);
  const home = raw.toLowerCase();
  for (const board of ["today board", "walk-in queue", "one board for today", "scheduling os"]) {
    assert.equal(home.includes(board), false, `konkurrierende Board-Positionierung: "${board}"`);
  }
});

// ─── 12. Natural Patient Copy Guard ───────────────────────────────────────────

test("Natural Patient Copy Guard: natürliche Patienten-Hauptbotschaft je Sprache", () => {
  const expect: Record<string, string> = {
    en: "book doctor appointments online",
    de: "arzttermine online buchen",
    fr: "rendez-vous médic",
    es: "médic",
    pt: "médic",
  };
  for (const [loc, frag] of Object.entries(expect)) {
    assert.ok(msg(loc).landing.heroTitle.toLowerCase().includes(frag), `${loc}: heroTitle ohne "${frag}"`);
  }
});

// ─── 13. Patient Journey Guard ────────────────────────────────────────────────

test("Patient Journey Guard: 3 sichtbare Schritte (auswählen → senden → Bestätigung)", () => {
  for (const loc of locales) {
    const l = msg(loc).landing;
    for (const k of ["journey1", "journey2", "journey3"]) {
      assert.ok((l[k] ?? "").trim().length > 2, `${loc}: ${k} fehlt`);
    }
  }
  const en = msg("en").landing;
  assert.ok(en.journey1.toLowerCase().includes("choose a time"), "EN journey1");
  assert.ok(en.journey2.toLowerCase().includes("send your request"), "EN journey2");
  assert.ok(en.journey3.toLowerCase().includes("clinic confirmation"), "EN journey3");
  const de = msg("de").landing;
  assert.ok(de.journey1.includes("Termin auswählen"), "DE journey1");
  assert.ok(de.journey2.includes("Anfrage senden"), "DE journey2");
  assert.ok(de.journey3.includes("Bestätigung der Praxis"), "DE journey3");
  const home = read(PAGE);
  assert.ok(home.includes('t("journey1")') && home.includes('t("journey3")'), "Homepage rendert Journey nicht");
});

// ─── 14. Pricing Scope Guard ──────────────────────────────────────────────────

test("Pricing Scope Guard: Pricing klar als Klinik-/Praxis-Sache markiert", () => {
  const en = (msg("en").landing.pricingForClinics ?? "").toLowerCase();
  assert.ok(en.includes("clinic") && en.includes("practice"), "EN pricingForClinics fehlt/unklar");
  for (const loc of locales) {
    assert.ok((msg(loc).landing.pricingForClinics ?? "").trim().length > 2, `${loc}: pricingForClinics fehlt`);
  }
  assert.ok(read(PAGE).includes('t("pricingForClinics")'), "Homepage zeigt Pricing-Scope-Hinweis nicht");
});

// ─── 15. Visual Hero Guard ────────────────────────────────────────────────────

test("Visual Hero Guard: anonyme Termin-Vorschaukarte im Hero (keine echten Daten)", () => {
  const en = msg("en").landing;
  for (const k of ["previewClinic", "previewToday", "previewAvailable", "previewRequest", "previewPending"]) {
    assert.ok((en[k] ?? "").trim().length > 1, `EN ${k} fehlt`);
  }
  assert.ok(en.previewAvailable.toLowerCase().includes("available"), "previewAvailable");
  assert.ok(en.previewRequest.toLowerCase().includes("appointment request"), "previewRequest");
  assert.ok(en.previewPending.toLowerCase().includes("clinic confirmation pending"), "previewPending");
  const home = read(PAGE);
  assert.ok(home.includes('t("previewClinic")') && home.includes('"09:00"') && home.includes('"10:30"'), "Hero-Vorschaukarte fehlt");
  assert.equal(/Sarah|Ahmed|Maria|Fatima|Mohammed|diagnosis|symptom/i.test(home), false, "mögliche PII/Diagnose im Homepage-Quelltext");
  // DE-Vorschaukarte trägt die geforderten lokalisierten Begriffe.
  const de = msg("de").landing;
  assert.ok(de.previewClinic.includes("Demo-Praxis"), "DE previewClinic");
  assert.ok(de.previewAvailable.includes("Verfügbar"), "DE previewAvailable");
  assert.ok(de.previewRequest.includes("Terminanfrage"), "DE previewRequest");
  assert.ok(de.previewPending.includes("Bestätigung der Praxis ausstehend"), "DE previewPending");
});

// ─── 16. Patient Navigation Guard ─────────────────────────────────────────────

test("Patient Navigation Guard: klarer Haupt-CTA, vereinfachte Navigation", () => {
  const home = read(PAGE);
  // Haupt-CTA = Termin buchen (btn-brand → /termin-buchen).
  assert.ok(home.includes('tNav("bookAppointment")'), "Haupt-CTA Termin buchen fehlt");
  assert.ok(home.includes('btn-brand ml-1'), "Termin-buchen-CTA ist nicht der primäre Header-Button");
  // 'Loslegen'/getStarted und 'Preise vergleichen' aus den Patienten-CTAs entfernt.
  assert.equal(home.includes('tNav("getStarted")'), false, "verwirrender 'Loslegen'-CTA noch vorhanden");
  assert.equal(home.includes('t("comparePrices")'), false, "'Preise vergleichen' verwirrt Patienten noch");
  // Neue, einfachere Nav-Items.
  assert.ok(home.includes('tNav("forClinics")') && home.includes('tNav("demoClinic")'), "Nav-Items Für Praxen/Demo-Praxis fehlen");
  for (const loc of locales) {
    assert.ok((msg(loc).nav?.forClinics ?? "").trim().length > 1, `${loc}: nav.forClinics fehlt`);
    assert.ok((msg(loc).nav?.demoClinic ?? "").trim().length > 1, `${loc}: nav.demoClinic fehlt`);
  }
});

// ─── 17. Clinics Section Guard ────────────────────────────────────────────────

test("Clinics Section Guard: 'Für Praxen' kompakt, unten, ohne Fachjargon", () => {
  for (const loc of locales) {
    const l = msg(loc).landing;
    assert.ok((l.clinicsTitle ?? "").trim().length > 3, `${loc}: clinicsTitle fehlt`);
    assert.ok((l.clinicsSubline ?? "").trim().length > 5, `${loc}: clinicsSubline fehlt`);
    for (const k of ["clinic1", "clinic2", "clinic3", "clinic4"]) {
      assert.ok((l[k] ?? "").trim().length > 2 && l[k].length <= 45, `${loc}: ${k} fehlt/zu lang`);
    }
  }
  const home = read(PAGE);
  assert.ok(
    home.includes('id="for-clinics"') && home.includes("clinicCards") && home.includes('t("clinicsTitle")'),
    "Praxis-Sektion (for-clinics) fehlt/unvollständig",
  );
});

// ─── 18. Secondary Brand Guard ────────────────────────────────────────────────

const PUBLIC_MSG_KEYS = [
  ["blog", "subtitle"],
  ["trust", "privacy1"],
  ["pricing", "providerCostNote"],
  ["pricing", "trial"],
  ["pricing", "trialInfo"],
];

test("Secondary Brand Guard: öffentliche Sekundär-Strings nutzen ClinicSlotHub, kein altes Slotfill", () => {
  for (const loc of locales) {
    const m = msg(loc);
    for (const [ns, key] of PUBLIC_MSG_KEYS) {
      const v = (m[ns]?.[key] ?? "").toLowerCase();
      assert.equal(v.includes("slotfill"), false, `${loc}: ${ns}.${key} zeigt altes 'Slotfill'`);
    }
    // Blog-Untertitel trägt die öffentliche Marke ClinicSlotHub.
    assert.ok((m.blog?.subtitle ?? "").includes("ClinicSlotHub"), `${loc}: blog.subtitle ohne ClinicSlotHub`);
  }
});

// ─── 19. Secondary Old Claim Guard ────────────────────────────────────────────

test("Secondary Old Claim Guard: keine Trial-/Twilio-/Alt-Claims in Pricing/Blog-Untertitel", () => {
  const banned = ["try free for 14 days", "try clinic pro", "try starter", "14-day free trial", "14 tage kostenlos", "fill appointment slots automatically", "soft launch"];
  for (const loc of locales) {
    const m = msg(loc);
    const pricingBlob = JSON.stringify(m.pricing ?? {}).toLowerCase();
    const blogSub = (m.blog?.subtitle ?? "").toLowerCase();
    for (const b of banned) {
      assert.equal(pricingBlob.includes(b), false, `${loc}: Pricing enthält "${b}"`);
      assert.equal(blogSub.includes(b), false, `${loc}: blog.subtitle enthält "${b}"`);
    }
  }
});

// ─── 20. Pricing Confusion Guard ──────────────────────────────────────────────

test("Pricing Confusion Guard: Pricing für Praxen/Kliniken, kein Patientenpreis", () => {
  for (const loc of locales) {
    const p = msg(loc).pricing ?? {};
    // Plan-CTA ist Praxiszugang-orientiert (nicht 'Try ...').
    const cta = (p.ctaStarter ?? "").toLowerCase();
    assert.ok(/clinic|clínic|cliniqu|prax|klinik|consult/.test(cta), `${loc}: pricing.ctaStarter nicht praxisorientiert`);
    assert.equal(/try /.test(cta), false, `${loc}: pricing.ctaStarter enthält Trial-Sprache`);
    // Audience-Marker (pricing.trial) adressiert Praxen/Kliniken.
    const tr = (p.trial ?? "").toLowerCase();
    assert.ok(/clinic|clínic|cliniqu|prax|klinik|consult/.test(tr), `${loc}: pricing.trial markiert nicht Praxen/Kliniken`);
  }
});

// ─── 21. Email Branding Guard ─────────────────────────────────────────────────

test("Email Branding Guard: Templates nutzen eine Brand-Einzelquelle, keine Versandaktivierung", () => {
  const tpl = read("lib/email/templates.ts");
  // Marke kommt aus lib/brand (BRAND_NAME/BRAND_TEAM_NAME) — eine konsistente Quelle.
  assert.ok(tpl.includes("BRAND_NAME") && tpl.includes("BRAND_TEAM_NAME"), "Email-Templates nutzen keine Brand-Einzelquelle");
  // Keine Aktivierung von Versanddiensten im Template selbst.
  assert.equal(/nodemailer|new Resend\(|sgMail|createTransport/.test(tpl), false, "Email-Template aktiviert Versandlogik");
});

// ─── 22. Public Legal Consistency Guard ───────────────────────────────────────

test("Public Legal Consistency Guard: keine Zahlung dargestellt, keine internen Technikbegriffe öffentlich", () => {
  // CEO-V2: öffentliche Pricing-Copy nennt keine internen Dienst-/Provider-Namen mehr,
  // sondern sagt neutral, dass keine Zahlung verarbeitet wird und Aktivierung nach Prüfung erfolgt.
  const TECH = /stripe|twilio|supabase|neon|resend|brevo|smtp|webhook|whatsapp|\bsms\b/;
  for (const loc of locales) {
    const p = msg(loc).pricing ?? {};
    const s = (p.stripeNotLive ?? "").toLowerCase();
    assert.ok(s.length > 0, `${loc}: pricing.stripeNotLive fehlt`);
    // Ehrliche Geldlogik: keine Zahlung wird verarbeitet (locale-äquivalent).
    assert.ok(/keine zahlung|no payment|aucun paiement|ningún pago|qualquer pagamento/.test(s), `${loc}: stripeNotLive ohne klare 'keine Zahlung'-Aussage`);
    // Keine internen Technikbegriffe öffentlich.
    assert.equal(TECH.test(s), false, `${loc}: stripeNotLive enthält internen Technikbegriff`);
    const note = (p.providerCostNote ?? "").toLowerCase();
    assert.equal(TECH.test(note), false, `${loc}: providerCostNote enthält internen Technikbegriff`);
  }
});

// ─── 23. Secondary Page Chrome Guard ──────────────────────────────────────────

test("Secondary Page Chrome Guard: öffentliche Sekundärseiten ohne altes Slotfill-Branding", () => {
  const files = [
    "app/[locale]/blog/page.tsx",
    "app/[locale]/blog/[slug]/page.tsx",
    "app/kontakt/layout.tsx",
    "app/pricing/layout.tsx",
    "app/auth/login/page.tsx",
  ];
  for (const f of files) {
    const src = read(f);
    // Kein altes öffentliches 'Slotfill'-Markenwort mehr (SlotFillLogo-Komponentenname bleibt erlaubt).
    const brandRefs = src.replace(/SlotFillLogo/g, "");
    assert.equal(/\bSlotfill\b/.test(brandRefs), false, `${f}: altes 'Slotfill'-Branding im öffentlichen Chrome`);
    // Keine Trial-Claims im öffentlichen Chrome.
    assert.equal(/14[- ](day|tage)|kostenlos testen|free trial/i.test(src), false, `${f}: Trial-Claim im öffentlichen Chrome`);
  }
});

// ─── 5. Medical Safety Guard ──────────────────────────────────────────────────

test("Medical Safety Guard: keine medizinischen/Trial-/Automatisierungs-Versprechen", () => {
  const banned = [
    "diagnosis",
    "treatment recommendation",
    "medical advice",
    "guaranteed appointment",
    "emergency",
    "stripe checkout",
    "sms automation",
    "whatsapp automation",
    "file upload",
    "medical record storage",
    "try for free",
    "free trial",
    "14-day",
    "soft launch",
  ];
  const home = read(PAGE).toLowerCase();
  for (const loc of locales) {
    const b = landingBlob(loc);
    for (const bad of banned) {
      assert.equal(b.includes(bad), false, `${loc}: verbotener Begriff in Landing-Copy: "${bad}"`);
    }
  }
  for (const bad of banned) {
    assert.equal(home.includes(bad), false, `Homepage enthält verbotenen Begriff: "${bad}"`);
  }
});

// ─── 6. Button Guard ──────────────────────────────────────────────────────────

test("Button Guard: keine toten CTAs, Book-CTA führt zur Booking-Route", () => {
  const home = read(PAGE);
  assert.equal(/href=["']#["']/.test(home), false, "toter Anker href=\"#\" auf Homepage");
  assert.equal(/<button[^>]*>\s*<\/button>/.test(home), false, "leerer Button auf Homepage");
  // Primärer Buchungs-CTA führt zur Booking-Route, Demo-CTA zur Demo-Praxis.
  assert.ok(home.includes('href={`/${locale}/termin-buchen`}'), "Book-appointment-CTA ohne Booking-Ziel");
  assert.ok(home.includes('href="/book/testpraxis-delta"'), "Demo-Clinic-CTA ohne Ziel");
});

// ─── 24. Live Error Prevention Guard (kein doppeltes <html>/<body>) ────────────

test("Live Error Prevention Guard: Locale-Layout rendert kein <html>/<body>", () => {
  // Kommentare entfernen — erklärende Hinweise dürfen die Tags erwähnen.
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  const layout = strip(read("app/[locale]/layout.tsx"));
  assert.equal(/<html[\s>]/.test(layout), false, "[locale]/layout.tsx rendert <html> → doppelte Dokument-Tags → Hydration-Crash (#418/#423)");
  assert.equal(/<body[\s>]/.test(layout), false, "[locale]/layout.tsx rendert <body> → Hydration-Crash");
  const root = read("app/layout.tsx");
  assert.ok(/<html[\s>]/.test(root) && /<body[\s>]/.test(root), "Root-Layout muss <html>/<body> rendern");
});

// ─── 25. Emergency Video Failure Guard ────────────────────────────────────────

test("Emergency Video Failure Guard: Briefing dokumentiert Crash + Vision", () => {
  const p = "docs/slotfill-emergency-product-briefing.md";
  assert.ok(existsSync(join(ROOT, p)), "Emergency-Briefing fehlt");
  const md = read(p).toLowerCase();
  for (const must of ["client-side exception", "no-go", "healthcare booking saas", "supersaas"]) {
    assert.ok(md.includes(must), `Briefing fehlt: "${must}"`);
  }
});

// ─── 26. Healthcare Vertical Guard ────────────────────────────────────────────

test("Healthcare Vertical Guard: nur Gesundheitsanbieter, keine fremden Branchen", () => {
  for (const loc of locales) {
    const blob = landingBlob(loc);
    assert.ok(/clinic|clínic|cliniqu|praxis|consult|prestador|gesundheit|santé|salud|saúde|health/.test(blob), `${loc}: keine Gesundheits-Vertikale`);
    for (const bad of ["friseur", "hairdress", "yoga", "sportkurs", "fitness class", "lehrer", "teacher", "restaurant", " hotel", "barber", "salon"]) {
      assert.equal(blob.includes(bad), false, `${loc}: fremde Branche "${bad}"`);
    }
  }
  const en = landingBlob("en");
  for (const must of ["doctor", "practice", "clinic", "health center"]) {
    assert.ok(en.includes(must), `EN Healthcare-Vertikale fehlt: ${must}`);
  }
});

// ─── 27. SaaS Completeness Guard ──────────────────────────────────────────────

test("SaaS Completeness Guard: Homepage zeigt vollständigen SaaS-Auftritt", () => {
  const home = read(PAGE);
  for (const ref of ["useCasesTitle", "providerFlowTitle", "patientFlowTitle", "clinicsTitle", "providerPreviewTitle", "cta3"]) {
    assert.ok(home.includes(`t("${ref}")`), `Homepage rendert ${ref} nicht`);
  }
  assert.ok(home.includes('id="for-providers"'), "for-providers-Anker fehlt");
  assert.ok(home.includes("/book/testpraxis-delta"), "Demo-Clinic-Link fehlt");
  assert.ok(home.includes("/termin-buchen"), "Booking-Link fehlt");
  assert.ok(home.includes("/auth/login"), "Practice-Login-Link fehlt");
  assert.ok(home.includes("/pricing"), "Pricing-Link fehlt");
});

// ─── 28. Visual Product Guard ─────────────────────────────────────────────────

test("Visual Product Guard: Patient- + Provider-Vorschau und Use-Cases sichtbar", () => {
  const home = read(PAGE);
  for (const ref of ["previewClinic", "previewAvailable", "providerPreviewTitle", "providerPreviewConfirm", "useCases"]) {
    assert.ok(home.includes(ref), `Homepage rendert Visual ${ref} nicht`);
  }
  assert.equal(/Sarah|Ahmed|Maria|Fatima|Mohammed|diagnosis|symptom/i.test(home), false, "PII/Diagnose im Homepage-Visual");
});

// ─── 29. Market Scope Guard (Legal-Hinweise + keine Hochregulierungs-Werbung) ──

test("Market Scope Guard: Legal-Markthinweise vorhanden, keine EU/US-Zielmarktwerbung", () => {
  const ms = getMarketScope("en");
  const agb = ms.agbBody.join(" ");
  for (const must of ["European Union", "United States", "Canada", "United Kingdom", "Australia", "New Zealand", "selected international markets"]) {
    assert.ok(agb.includes(must), `AGB-Marktscope fehlt: ${must}`);
  }
  assert.ok(/rejected|not processed/.test(agb), "AGB: keine Ablehnungs-Klausel");
  assert.ok(/legal review is required/i.test(ms.privacyNotice), "Privacy: 'legal review required' fehlt");
  // Keine falsche Compliance-Garantie.
  for (const bad of ["gdpr-ready", "hipaa-ready", "fully compliant", "guaranteed compliance", "medical compliance guaranteed"]) {
    assert.equal((agb + " " + ms.privacyBody + " " + ms.privacyNotice).toLowerCase().includes(bad), false, `falsche Compliance-Aussage: ${bad}`);
  }
  // Legal-Komponenten rendern die Market-Scope-Notiz.
  for (const f of ["components/legal/AgbContent.tsx", "components/legal/DatenschutzContent.tsx", "components/legal/ImpressumContent.tsx"]) {
    assert.ok(read(f).includes("MarketScopeNotice"), `${f}: MarketScopeNotice fehlt`);
  }
  // Keine öffentliche Hochregulierungs-Zielmarktwerbung / keine Armuts-Wörter in der Landing-Copy.
  for (const loc of locales) {
    const blob = landingBlob(loc);
    for (const bad of ["for eu clinics", "for german clinics", "for us clinics", "for uk clinics", "for canadian clinics", "for australian clinics", "for european healthcare", "third world", "poor clinics", "low-income", "developing countries", "schwellenländer", "arme kliniken"]) {
      assert.equal(blob.includes(bad), false, `${loc}: unzulässige Marktaussage "${bad}"`);
    }
  }
});

// ─── 30. Booking Notice Guard ─────────────────────────────────────────────────

test("Booking Notice Guard: Buchungsseite zeigt Selected-Markets-Hinweis", () => {
  const tb = read("app/[locale]/termin-buchen/page.tsx");
  assert.ok(tb.includes("getMarketScope") && tb.includes("bookingNotice"), "termin-buchen ohne Market-Scope-Hinweis");
  const en = getMarketScope("en").bookingNotice.toLowerCase();
  assert.ok(en.includes("selected markets") && en.includes("rejected"), "bookingNotice unklar");
});

// ─── 31. Pricing Stability Guard (statisch, ohne DB/Stripe) ───────────────────

test("Pricing Stability Guard: keine DB-/Stripe-Abhängigkeit, statische Pläne", () => {
  const pr = read("app/[locale]/pricing/page.tsx");
  assert.ok(pr.includes("STATIC_PLANS"), "Pricing nutzt keine statischen Pläne");
  assert.equal(/fetch\(\s*["']\/api\/plans/.test(pr), false, "Pricing fetcht weiterhin /api/plans (DB-Abhängigkeit)");
  assert.equal(/\/api\/stripe\/checkout/.test(pr), false, "Pricing ruft Stripe-Checkout auf");
  // Plan-CTA leitet zur Kontakt-/Praxiszugang-Anfrage.
  assert.ok(/\/kontakt/.test(pr), "Pricing-CTA leitet nicht zur Kontaktanfrage");
});

// ─── 32. Healthcare Market Positioning Guard ──────────────────────────────────

test("Healthcare Market Positioning Guard: 'selected international markets', kein 'emerging markets' öffentlich", () => {
  for (const loc of locales) {
    const badge = (msg(loc).landing?.heroBadge ?? "").toLowerCase();
    assert.ok(/selected|ausgewählt|sélectionn|seleccionad|selecionad/.test(badge), `${loc}: heroBadge ohne 'selected markets'`);
    // 'emerging markets' nicht im öffentlichen Hero-Badge.
    assert.equal(badge.includes("emerging market"), false, `${loc}: 'emerging markets' im Badge`);
  }
});

// ─── 33. Audience Scope Guard ─────────────────────────────────────────────────

test("Audience Scope Guard: Zielgruppe breit (viele Gesundheitsanbieter), Karten als Beispiele, keine Über-Reichweite", () => {
  const breadth: Record<string, string> = { de: "viele arten", en: "many types", fr: "nombreux types", es: "muchos tipos", pt: "muitos tipos" };
  const examples: Record<string, string> = { de: "beispiele", en: "examples", fr: "exemples", es: "ejemplos", pt: "exemplos" };
  const review: Record<string, string> = { de: "prüfung", en: "subject to review", fr: "vérification", es: "revisión", pt: "análise" };
  for (const loc of locales) {
    const l = msg(loc).landing;
    const title = (l.useCasesTitle ?? "").toLowerCase();
    const sub = (l.useCasesSubline ?? "").toLowerCase();
    // Überschrift signalisiert Breite (nicht nur drei Kategorien).
    assert.ok(title.includes(breadth[loc]), `${loc}: useCasesTitle ohne Breiten-Signal "${breadth[loc]}"`);
    // Karten sind als Beispiele markiert, Aktivierung nur nach Prüfung.
    assert.ok(sub.includes(examples[loc]), `${loc}: useCasesSubline kennzeichnet Bereiche nicht als Beispiele`);
    assert.ok(sub.includes(review[loc]), `${loc}: useCasesSubline ohne Aktivierung-nach-Prüfung`);
    // Breite Zusatzliste + dezentes Beispiel-Label vorhanden.
    assert.ok((l.useCasesMore ?? "").trim().length > 10, `${loc}: useCasesMore (breite Zielgruppe) fehlt`);
    assert.ok((l.useCasesExamplesLabel ?? "").trim().length > 2, `${loc}: useCasesExamplesLabel fehlt`);
    // Keine Über-Reichweite / falsche Compliance im Zielgruppen-Block.
    const scopeBlob = [title, sub, l.useCasesMore ?? "", ...["useCase1", "useCase2", "useCase3", "useCase4", "useCase5", "useCase6"].map((k) => l[k] ?? "")].join(" ").toLowerCase();
    for (const bad of ["worldwide", "all countries", "weltweit", "alle länder", "guaranteed compliance", "garantiert compliant", "only dental", "only therapy"]) {
      assert.equal(scopeBlob.includes(bad), false, `${loc}: Über-Reichweite/Enge im Zielgruppen-Block: "${bad}"`);
    }
  }
  // EN nennt klar breite Anbieter (Praxen + Kliniken).
  const en = msg("en").landing;
  assert.ok((en.useCasesSubline ?? "").toLowerCase().includes("medical practices"), "EN useCasesSubline nennt keine medical practices");
  assert.ok((en.useCasesSubline ?? "").toLowerCase().includes("clinics"), "EN useCasesSubline nennt keine clinics");
  // Homepage rendert das Beispiel-Label und die breite Zusatzzeile.
  const home = read(PAGE);
  assert.ok(home.includes('t("useCasesExamplesLabel")'), "Homepage rendert useCasesExamplesLabel nicht");
  assert.ok(home.includes('t("useCasesMore")'), "Homepage rendert useCasesMore nicht");
});

// ─── 34. Provider/Patient Funnel Guard ────────────────────────────────────────

test("Provider/Patient Funnel Guard: Käuferweg (Preise/Zugang/Login) und Patientenweg (Anfrage ohne Login) klar getrennt", () => {
  const noLogin: Record<string, string> = { de: "ohne login", en: "no login", fr: "connexion", es: "inicio de sesión", pt: "início de sessão" };
  const review: Record<string, string> = { de: "prüfung", en: "after review", fr: "vérification", es: "revisión", pt: "análise" };
  for (const loc of locales) {
    const m = msg(loc);
    const l = m.landing;
    // Beide Wege als Copy vorhanden.
    assert.ok((m.nav?.requestAccess ?? "").trim().length > 2, `${loc}: nav.requestAccess (Praxiszugang anfragen) fehlt`);
    for (const k of ["audienceSplitTitle", "audienceSplitSubline", "audienceSplitProviderTitle", "audienceSplitProviderNote", "audienceSplitPatientTitle", "audienceSplitPatientNote", "audienceSplitPatientCta"]) {
      assert.ok((l[k] ?? "").trim().length > 2, `${loc}: landing.${k} fehlt`);
    }
    // Patientenweg: ausdrücklich ohne Login. Praxisweg: Zugang nur nach Prüfung.
    assert.ok((l.audienceSplitPatientNote ?? "").toLowerCase().includes(noLogin[loc]), `${loc}: Patient-Note ohne 'kein Login'-Hinweis`);
    assert.ok((l.audienceSplitProviderNote ?? "").toLowerCase().includes(review[loc]), `${loc}: Provider-Note ohne 'Zugang nur nach Prüfung'`);
    // Keine Selfservice-/Registrierungs-/Patient-Login-Copy im öffentlichen Funnel.
    const funnelBlob = [l.audienceSplitTitle, l.audienceSplitSubline, l.audienceSplitProviderTitle, l.audienceSplitProviderNote, l.audienceSplitPatientTitle, l.audienceSplitPatientNote, l.audienceSplitPatientCta, m.nav?.requestAccess]
      .map((s) => (s ?? "")).join(" ").toLowerCase();
    for (const bad of ["kostenlos registrieren", "konto erstellen", "patient login", "patientenkonto", "sofort aktivieren", "free trial", "14 tage", "weltweit", "all countries", "guaranteed compliance", "create account", "sign up free", "register now"]) {
      assert.equal(funnelBlob.includes(bad), false, `${loc}: verbotene Funnel-Copy "${bad}"`);
    }
  }
  // Homepage rendert beide Wege + sichere Ziele.
  const home = read(PAGE);
  for (const ref of ["audienceSplitTitle", "audienceSplitProviderTitle", "audienceSplitPatientTitle", "audienceSplitProviderNote", "audienceSplitPatientNote", "audienceSplitPatientCta"]) {
    assert.ok(home.includes(`t("${ref}")`), `Homepage rendert ${ref} nicht`);
  }
  assert.ok(home.includes('tNav("requestAccess")'), "Homepage rendert Praxiszugang-anfragen-CTA nicht");
  assert.ok(home.includes('tNav("login")') && home.includes('/auth/login'), "Praxis-Login im Funnel fehlt");
  assert.ok(home.includes('tNav("pricing")') && home.includes('#pricing'), "Preise im Funnel fehlen");
  assert.ok(home.includes("/termin-buchen"), "Patienten-Anfrageweg (/termin-buchen) fehlt");
  // Käuferweg führt zur geprüften Zugangsanfrage (Kontakt), kein Selfservice-Signup.
  assert.ok(home.includes('/kontakt'), "Praxiszugang-Anfrage zeigt nicht auf /kontakt");
  assert.equal(home.includes("/auth/register"), false, "Homepage verlinkt wieder auf /auth/register (Selfservice-Signup)");
  // Register bleibt gesperrt (Redirect zu /de/kontakt) — kein erneutes Öffnen.
  assert.ok(/redirect\(\s*["']\/de\/kontakt["']\s*\)/.test(read("app/auth/register/page.tsx")), "Register-Redirect zu /de/kontakt nicht mehr vorhanden");
});

// ─── 35. Hero Funnel Polish Guard ─────────────────────────────────────────────

test("Hero Funnel Polish Guard: Arztgesicht frei (object-position), Demo-Karte mobil ausgeblendet, ruhiger Hero", () => {
  const home = read(PAGE);
  // HealthcareImage unterstützt einen gesichtsfreundlichen object-position-Crop.
  const hc = read("components/ui/HealthcareImage.tsx");
  assert.ok(hc.includes("objectPosition"), "HealthcareImage hat keine objectPosition-Steuerung");
  assert.ok(hc.includes("style={{ objectPosition }}"), "HealthcareImage wendet objectPosition nicht auf das <Image> an");
  // Hero-Bild setzt object-position, damit das Gesicht im mobilen Crop sichtbar bleibt.
  assert.ok(home.includes('objectPosition="50% 28%"'), "Hero-Bild ohne gesichtsfreundliche object-position");
  // Hero-Bild nutzt mobil ein flacheres Seitenverhältnis (weniger harter Crop).
  assert.ok(home.includes("aspect-[4/3] w-full shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]"), "Hero-Bild ohne entschärften Mobile-Crop");
  // Schwebende Demo-/Kalenderkarte ist auf ALLEN Breakpoints ausgeblendet (CEO-Wunsch: ruhiges Hero-Bild).
  const cardClass = (home.match(/z-10 hidden w-56[^"]*/) ?? [""])[0];
  assert.ok(cardClass.length > 0, "Demo-Karte (z-10 hidden w-56) nicht gefunden");
  assert.equal(/\bsm:block\b|\bmd:block\b|\blg:block\b|\bsm:flex\b/.test(cardClass), false, "Demo-Karte wird auf größeren Screens wieder eingeblendet");
  // Karte bleibt als PII-freies Vorschau-Markup im DOM (kein Anzeige-Flag) — keine Fake-OS-Chrome.
  assert.ok(home.includes('t("previewClinic")') && home.includes('"09:00"'), "Hero-Vorschau-Markup (previewClinic/Slots) entfernt");
  // Keine Garantie-/Notfall-Claims im Hero/Landing.
  for (const loc of locales) {
    const blob = landingBlob(loc);
    for (const bad of ["automatic confirmation guaranteed", "automatische bestätigung garantiert", "guaranteed appointment", "garantierter termin", "instant appointment", "soforttermin"]) {
      assert.equal(blob.includes(bad), false, `${loc}: Garantie-/Notfall-Claim in Landing-Copy: "${bad}"`);
    }
  }
});

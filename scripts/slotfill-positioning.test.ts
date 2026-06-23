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

test("Visual Hero Guard: kein Mockup-/Slot-Overlay im Hero, keine echten/künstlichen Daten", () => {
  const home = read(PAGE);
  // Kein Hero-Overlay mit künstlichen Slots/Uhrzeiten/Demo-Daten mehr (Karte hart entfernt).
  assert.equal(home.includes('"09:00"') || home.includes('"10:30"'), false, "künstliche Mockup-Uhrzeit im Hero/Quelltext");
  assert.equal(home.includes("SHOW_HERO_FLOATING_DEMO_CARD"), false, "Hero-Floating-Demo-Card-Konstante wieder vorhanden");
  // Keine PII/Diagnose im Quelltext.
  assert.equal(/Sarah|Ahmed|Maria|Fatima|Mohammed|diagnosis|symptom/i.test(home), false, "mögliche PII/Diagnose im Homepage-Quelltext");
  // Entfernte Mockup-Keys sind nicht mehr im (öffentlich ausgelieferten) landing-Namespace.
  for (const loc of locales) {
    const l = msg(loc).landing;
    for (const k of ["previewClinic", "previewToday", "previewAvailable", "previewRequest", "previewPending", "providerPreviewConfirm", "providerPreviewDecline", "providerPreviewNew", "providerPreviewRequests"]) {
      assert.equal(k in l, false, `${loc}: veralteter Mockup-Key landing.${k} noch vorhanden`);
    }
  }
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
  for (const ref of ["providerPreviewTitle", "providerWorkflow1", "patientFlowTitle", "useCases"]) {
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
  const tb = read("app/[locale]/termin-buchen/TerminBuchenClient.tsx");
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

test("Hero Funnel Polish Guard: Arztgesicht frei (object-position), kein Hero-Overlay, ruhiger Hero", () => {
  const home = read(PAGE);
  // HealthcareImage unterstützt einen gesichtsfreundlichen object-position-Crop.
  const hc = read("components/ui/HealthcareImage.tsx");
  assert.ok(hc.includes("objectPosition"), "HealthcareImage hat keine objectPosition-Steuerung");
  assert.ok(hc.includes("style={{ objectPosition }}"), "HealthcareImage wendet objectPosition nicht auf das <Image> an");
  // Hero-Bild setzt object-position, damit Kopf/Gesicht im Crop sichtbar bleiben.
  assert.ok(/objectPosition="50% (2[05]|1[5-9])%"/.test(home), "Hero-Bild ohne gesichtsfreundliche object-position (Kopf-Crop)");
  // Hero-Bild nutzt mobil ein flacheres Seitenverhältnis (weniger harter Crop).
  assert.ok(home.includes("aspect-[4/3] w-full shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]"), "Hero-Bild ohne entschärften Mobile-Crop");
  // KEIN Hero-Overlay/Floating-Demo-Card mehr (komplett entfernt, auch die Konstante).
  assert.equal(home.includes("SHOW_HERO_FLOATING_DEMO_CARD"), false, "Hero-Floating-Demo-Card-Konstante/Gate wieder vorhanden");
  assert.equal(home.includes('"09:00"') || home.includes('"10:30"'), false, "künstliche Slot-Uhrzeit im Hero/Quelltext");
  // Keine Garantie-/Notfall-Claims im Hero/Landing.
  for (const loc of locales) {
    const blob = landingBlob(loc);
    for (const bad of ["automatic confirmation guaranteed", "automatische bestätigung garantiert", "guaranteed appointment", "garantierter termin", "instant appointment", "soforttermin"]) {
      assert.equal(blob.includes(bad), false, `${loc}: Garantie-/Notfall-Claim in Landing-Copy: "${bad}"`);
    }
  }
});

// ─── 36. Hero CTA Separation Guard ────────────────────────────────────────────

test("Hero CTA Separation Guard: Hero ist patientenorientiert, kein Demo-/Praxis-/Login-CTA daneben", () => {
  const home = read(PAGE);
  // Hero-CTA-Block (von ctaPrimary bis zur Patient-Journey-Reihe).
  const heroCta = (home.match(/\{t\("ctaPrimary"\)\}[\s\S]*?Patient journey/) ?? [""])[0];
  assert.ok(heroCta.length > 0, "Hero-CTA-Block nicht gefunden");
  // Sekundärer Hero-CTA ist 'So funktioniert es' → #how-patients (Patientenfluss).
  assert.ok(heroCta.includes('t("ctaHowItWorks")') && heroCta.includes("#how-patients"), "Hero-Sekundär-CTA ist nicht 'So funktioniert es' → #how-patients");
  // Kein Praxis-/Demo-/Login-CTA direkt im Hero-CTA-Block.
  for (const bad of ["/auth/login", "/book/testpraxis-delta", 't("ctaSecondary")', 'tNav("login")', 'tNav("demoClinic")', 'tNav("requestAccess")']) {
    assert.equal(heroCta.includes(bad), false, `Hero-CTA mischt Patient + Praxis/Demo/Login: "${bad}"`);
  }
  // ctaHowItWorks in allen Locales vorhanden.
  for (const loc of locales) {
    assert.ok((msg(loc).landing?.ctaHowItWorks ?? "").trim().length > 2, `${loc}: landing.ctaHowItWorks fehlt`);
  }
});

// ─── 37. Pricing Plan Naming Consistency Guard ────────────────────────────────

test("Pricing Plan Naming Consistency Guard: Plannamen Starter/Practice/Clinic, kein 'Professional', keine Trial-CTA", () => {
  const pricingPage = read("app/[locale]/pricing/page.tsx");
  assert.equal(/aus Professional|in Professional/.test(pricingPage), false, "Pricing-Features referenzieren noch 'Professional' statt 'Practice'");
  for (const loc of locales) {
    const p = msg(loc).pricing ?? {};
    const ev = p.featureKeys?.everythingInProfessional ?? "";
    assert.equal(/Professional/.test(ev), false, `${loc}: featureKeys.everythingInProfessional referenziert noch 'Professional'`);
    for (const k of ["ctaProfessional", "ctaPraxisPlus"]) {
      const v = p[k] ?? "";
      assert.equal(/Professional/.test(v), false, `${loc}: pricing.${k} referenziert 'Professional'`);
      assert.equal(/\btest|\btry |essayer|probar|testar/i.test(v), false, `${loc}: pricing.${k} nutzt Trial-Sprache`);
    }
  }
});

// ─── 38. Formal Address Guard (DE B2B) ────────────────────────────────────────

test("Formal Address Guard: deutsche Copy nutzt durchgehend 'Sie', kein informelles 'du'", () => {
  const informal = /\b(du|dein|deine|deiner|deinem|deinen|dich|dir)\b/i;
  const walk = (obj: Record<string, unknown>, path: string) => {
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? `${path}.${k}` : k;
      if (typeof v === "string") {
        assert.equal(informal.test(v), false, `DE ${p} nutzt informelles 'du' statt formellem 'Sie': "${v}"`);
      } else if (v && typeof v === "object") {
        walk(v as Record<string, unknown>, p);
      }
    }
  };
  walk(msg("de") as Record<string, unknown>, "");
});

// ─── 39. Pricing Value Claim Guard ────────────────────────────────────────────

test("Pricing Value Claim Guard: kein ROI-/Umsatz-/Gewinn-Versprechen in valueProposition", () => {
  for (const loc of locales) {
    const vp = (msg(loc).pricing?.valueProposition ?? "").toLowerCase();
    assert.ok(vp.length > 5, `${loc}: valueProposition fehlt`);
    for (const bad of ["justify the monthly", "monatsbetrag rechtfertig", "justifier le coût", "justificarse el coste", "justificar o custo", "filled appointment", "gefüllter termin", "rendez-vous comblé", "cita rellenada", "consulta preenchida", "roi", "garantiert"]) {
      assert.equal(vp.includes(bad), false, `${loc}: valueProposition mit ROI-/Umsatz-Versprechen: "${bad}"`);
    }
  }
});

// ─── 40. Public Demo Wording Guard ────────────────────────────────────────────

test("Public Demo Wording Guard: keine öffentliche Demo-/Mockup-Sprache auf der Homepage", () => {
  const home = read(PAGE);
  // Künstliche Ticketnummer + 'Neu'-SaaS-Badge aus der öffentlichen Provider-Karte entfernt.
  assert.equal(home.includes("#1042"), false, "Künstliche Ticketnummer #1042 auf der Homepage");
  assert.equal(home.includes('t("providerPreviewNew")'), false, "'Neu'-SaaS-Badge wird noch auf der Homepage gerendert");
  // Öffentlich gerenderte Demo-Wording-Keys sind neutralisiert (kein 'Demo-Praxis'/'Demo clinic'/'clínica demo' …).
  const demoRx = /demo[- ]?praxis|demo clinic|clinique démo|clinique de démonstr|clínica demo|clínica de demonstr/i;
  for (const loc of locales) {
    const m = msg(loc);
    for (const [k, v] of [["nav.demoClinic", m.nav?.demoClinic], ["landing.cta3", m.landing?.cta3], ["landing.ctaSecondary", m.landing?.ctaSecondary]] as const) {
      assert.equal(demoRx.test(v ?? ""), false, `${loc}: ${k} ist nicht neutralisiert (Demo-Sprache): "${v}"`);
      assert.ok((v ?? "").trim().length > 3, `${loc}: ${k} fehlt`);
    }
    // Neutrale Workflow-Zeilen (kein Mockup, keine Fake-Daten) vorhanden.
    for (const k of ["providerWorkflow1", "providerWorkflow2", "providerWorkflow3"]) {
      assert.ok((m.landing?.[k] ?? "").trim().length > 4, `${loc}: landing.${k} (neutrale Workflow-Zeile) fehlt`);
    }
  }
  // Provider-Karte rendert die neutralen Workflow-Zeilen; Beispiel-Buchungsroute bleibt erhalten.
  assert.ok(home.includes('t("providerWorkflow1")'), "Provider-Karte rendert keine neutrale Workflow-Zeile");
  assert.ok(home.includes("/book/testpraxis-delta"), "Beispiel-Buchungsroute /book/testpraxis-delta wurde entfernt");
  // WICHTIG: next-intl shippt alle Message-Werte ins HTML (i18n-JSON). Daher dürfen die
  // öffentlich ausgelieferten Namespaces (landing/nav/pricing) KEINE Demo-/Dashboard-/
  // Mockup-Strings enthalten — sonst sind sie per HTML-Grep auffindbar.
  const shippedRx = /Demo-Praxis|Demo clinic|Demo Clinic|Praxis-Dashboard|Practice dashboard|Eingehende Terminanfragen|Incoming appointment requests|#1042|09:00|10:30|sample booking page|demo booking page|practice\/demo|cabinet\/démo|consulta\/demo|consultório\/demo|Demo-Buchungsseite|Praxis-\/Demo/i;
  for (const loc of locales) {
    const m = msg(loc) as Record<string, Record<string, string>>;
    for (const ns of ["landing", "nav", "pricing"]) {
      const blob = JSON.stringify(m[ns] ?? {});
      const hit = blob.match(shippedRx);
      assert.equal(hit, null, `${loc}: Namespace '${ns}' shippt verbotenen Demo-/Mockup-String: "${hit?.[0]}"`);
    }
  }
});

// ─── 41. i18n Public Shipping Guard ───────────────────────────────────────────

test("i18n Public Shipping Guard: nur öffentliche Namespaces gehen an den Client (keine privaten im HTML)", () => {
  const layout = read("app/[locale]/layout.tsx");
  assert.equal(/messages=\{messages\}/.test(layout), false, "Layout shippt komplette messages (inkl. privater Namespaces) an den Client");
  assert.ok(layout.includes("PUBLIC_NAMESPACES"), "Layout beschränkt nicht auf öffentliche Namespaces");
  assert.ok(/messages=\{publicMessages\}/.test(layout), "Provider nutzt nicht die gefilterten publicMessages");
  const m = layout.match(/PUBLIC_NAMESPACES\s*=\s*\[([^\]]*)\]/);
  assert.ok(m, "PUBLIC_NAMESPACES-Whitelist nicht gefunden");
  const list = m![1];
  for (const priv of ["auth", "dashboard", "admin", "errors", "settings", "subscription", "patients", "waitlist"]) {
    assert.equal(new RegExp(`["']${priv}["']`).test(list), false, `Privater Namespace '${priv}' wird öffentlich ausgeliefert`);
  }
});

// ─── 42. Public Auto-Confirmation Guard ───────────────────────────────────────

test("Public Auto-Confirmation Guard: öffentliche Copy suggeriert keine automatische Terminbestätigung als Standard", () => {
  const collectPublic = (loc: string) => {
    const m = msg(loc) as Record<string, Record<string, unknown>>;
    const out: string[] = [];
    const walk = (x: unknown) => {
      if (typeof x === "string") out.push(x);
      else if (x && typeof x === "object") Object.values(x).forEach(walk);
    };
    for (const ns of ["landing", "pricing", "contact"]) walk(m[ns]);
    return out;
  };
  for (const loc of locales) {
    for (const v of collectPublic(loc)) {
      assert.equal(/oder[^.]{0,60}automatisch|or[^.]{0,60}automatically|automatisch nach|automatically (according|by)|automatically confirmed|falls ausdrücklich aktiviert|if explicitly enabled|auto-confirm/i.test(v), false, `${loc}: öffentliche Auto-Bestätigungs-Suggestion: "${v}"`);
    }
  }
  const en = msg("en").landing.onlineBookingDesc ?? "";
  assert.ok(/manually/i.test(en) && /no automatic/i.test(en), "EN onlineBookingDesc nicht klar manuell");
});

// ─── 43. Honeypot Invisibility Guard ──────────────────────────────────────────

test("Honeypot Invisibility Guard: off-screen, nicht fokussierbar, ohne grepbaren Hinweistext", () => {
  const comp = read("components/ui/FormAntiSpamFields.tsx");
  assert.ok(comp.includes("HONEYPOT_FIELD") && comp.includes("TIMESTAMP_FIELD"), "Anti-Spam-Felder unvollständig (Bot-Schutz)");
  assert.ok(comp.includes('aria-hidden="true"'), "Honeypot-Wrapper nicht aria-hidden");
  assert.ok(comp.includes("tabIndex={-1}"), "Honeypot-Input ist fokussierbar (tabIndex fehlt)");
  assert.ok(comp.includes('left: "-9999px"'), "Honeypot nicht off-screen positioniert");
  // Technischer Feldname bleibt erhalten (Bots finden das Feld weiterhin).
  assert.ok(read("lib/form-abuse.ts").includes('HONEYPOT_FIELD = "company_url"'), "technischer Honeypot-Feldname company_url entfernt");
  // Kein menschenlesbarer/grepbarer Hinweistext im ausgelieferten JSX (Kommentare + technische
  // Variablennamen wie HONEYPOT_FIELD ausgenommen — die rendern als name="company_url", nicht als Text).
  const stripped = comp
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/HONEYPOT_FIELD|TIMESTAMP_FIELD/g, "");
  assert.equal(/Company website|leave this field empty|leave empty|do not fill|dieses Feld leer/i.test(stripped), false, "Honeypot zeigt grepbaren Hinweistext im HTML");
  // Kein Hinweis-Text via placeholder/aria-label/title (würde ebenfalls im HTML landen).
  assert.equal(/placeholder=|aria-label=|\btitle=/.test(stripped), false, "Honeypot nutzt placeholder/aria-label/title (grepbarer Hinweis)");
});

// ─── 44. Booking Page Public Copy Guard ───────────────────────────────────────

test("Booking Page Public Copy Guard: /termin-buchen force-dynamic, Marker, manuelle Bestätigung, kein Auto-Confirm", () => {
  const wrapper = read("app/[locale]/termin-buchen/page.tsx");
  const client = read("app/[locale]/termin-buchen/TerminBuchenClient.tsx");
  // Route ist erzwungen dynamisch (kein altes SSG-Artefakt).
  assert.ok(/export const dynamic\s*=\s*["']force-dynamic["']/.test(wrapper), "/termin-buchen ohne force-dynamic");
  assert.ok(/export const revalidate\s*=\s*0/.test(wrapper), "/termin-buchen ohne revalidate = 0");
  // Eindeutiger Live-Parity-Marker.
  assert.ok(client.includes('data-booking-copy-version="manual-confirmation-only-v2"'), "Live-Marker manual-confirmation-only-v2 fehlt");
  // Kein Auto-Confirm in der sichtbaren öffentlichen Copy (Logik-/Variablennamen wie
  // `autoConfirmed`/data-testid bleiben erlaubt — Booking-Logik wird nicht geändert).
  for (const bad of ["automatische Bestätigung erfolgt nur", "falls die Praxis dies ausdrücklich eingerichtet hat", "in der Regel manuell", "automatically confirmed without", "if explicitly enabled", "automatically according to safe rules"]) {
    assert.equal(client.includes(bad), false, `/termin-buchen wirbt mit Auto-Bestätigung: "${bad}"`);
  }
  // Klare manuelle Bestätigung (DE) + EN-Safe-Copy + keine automatische Zusage ohne Freigabe.
  assert.ok(/bestätigt den Termin manuell/.test(client), "/termin-buchen ohne klare manuelle Bestätigung (DE)");
  assert.ok(/keine automatische Terminbestätigung ohne Freigabe/i.test(client), "/termin-buchen ohne 'keine automatische Terminbestätigung ohne Freigabe'");
  assert.ok(/no automatic appointment confirmation without approval/i.test(client), "/termin-buchen ohne EN-Safe-Copy");
  // Kein sichtbarer Honeypot-Hinweistext; Bot-Schutz über die geteilte Komponente.
  assert.equal(/Company website|leave this field empty|do not fill/i.test(client), false, "/termin-buchen zeigt Honeypot-Hinweistext");
  assert.ok(client.includes("FormAntiSpamFields"), "/termin-buchen ohne Form-Abuse-Schutz (FormAntiSpamFields)");
});

// ─── 45. Mobile Navigation Guard ──────────────────────────────────────────────

test("Mobile Navigation Guard: kontrolliertes Mobile-Menü, schließt sauber, kein Overflow, korrekte Wege", () => {
  const mm = read("components/MobileMenu.tsx");
  // Kontrollierte Client-Komponente (kein offenes <details> mehr).
  assert.ok(mm.includes('"use client"'), "MobileMenu ist keine Client-Komponente");
  assert.ok(/useState/.test(mm) && /setOpen/.test(mm), "MobileMenu ohne kontrollierten open-State");
  // Schließt bei Link-Klick, Scroll, Klick außerhalb, Escape.
  assert.ok((mm.match(/onClick=\{\(\) => setOpen\(false\)\}/g) ?? []).length >= 4, "Menü-Links schließen das Menü nicht per onClick");
  assert.ok(/addEventListener\("scroll"/.test(mm), "Menü schließt nicht beim Scrollen");
  assert.ok(/contains\(/.test(mm), "Menü schließt nicht bei Klick außerhalb");
  // Voller, viewport-breiter Drawer (inset-x-4 = links/rechts 1rem) unter dem Header —
  // kein halbes/abgeschnittenes Fenster, kein horizontaler Overflow.
  assert.ok(/inset-x-4/.test(mm), "Mobile-Menü-Drawer ohne inset-x-4 (Viewport-breit, kein Abschneiden)");
  assert.ok(/\bfixed\b/.test(mm) && /\btop-16\b/.test(mm), "Mobile-Menü-Drawer nicht sauber unter dem Header fixiert");
  // Keine feste Breite, die breiter als der Viewport werden kann.
  assert.equal(/\bw-(64|72|80|96)\b/.test(mm), false, "Mobile-Menü nutzt feste Breite (Abschneide-/Overflow-Risiko)");
  // Nur sm:hidden (mobil), Desktop unberührt.
  assert.ok(/sm:hidden/.test(mm), "Mobile-Menü nicht auf Mobile beschränkt");
  // Korrekte Wege als Labels durchgereicht; keine Registrierung/Patient-Login/Demo-Praxis.
  const home = read(PAGE);
  assert.ok(home.includes("<MobileMenu"), "Homepage rendert MobileMenu nicht");
  for (const ref of ['tNav("requestAccess")', 'tNav("login")', 'tNav("pricing")', 't("audienceSplitProviderTitle")', 't("audienceSplitPatientCta")']) {
    assert.ok(home.includes(ref), `MobileMenu-Label ${ref} fehlt`);
  }
  for (const bad of ["/auth/register", "kostenlos registrieren", "Konto erstellen", "Patient Login", "Demo-Praxis", "Demo clinic"]) {
    assert.equal(mm.includes(bad), false, `Mobile-Menü enthält verbotene Copy/Link: "${bad}"`);
  }
});

// ─── 46. Mobile Header Guard ──────────────────────────────────────────────────

test("Mobile Header Guard: Hamburger neben sichtbarem Brand-Logo, Termin-buchen + Sprachschalter erreichbar", () => {
  const home = read(PAGE);
  // Marke bleibt im Header sichtbar (Logo nutzt die öffentliche Marke; auf Mobile Icon).
  assert.ok(home.includes("<SlotFillLogo"), "Brand-Logo fehlt im Header");
  const logo = read("components/ui/SlotFillLogo.tsx");
  assert.ok(logo.includes("PUBLIC_BRAND_NAME"), "Logo nutzt die öffentliche Marke nicht");
  assert.ok(/inline-flex sm:hidden/.test(logo), "Brand-Icon wird auf Mobile nicht angezeigt (Marke verschwindet)");
  // Hamburger steht in derselben linken Gruppe direkt vor dem Logo (nahe der Marke).
  const headerStart = home.indexOf("max-w-6xl items-center justify-between");
  const leftGroup = home.slice(headerStart, headerStart + 1200);
  const iMenu = leftGroup.indexOf("<MobileMenu");
  const iLogo = leftGroup.indexOf("<SlotFillLogo");
  assert.ok(iMenu > -1 && iLogo > -1 && iMenu < iLogo, "Hamburger sitzt nicht direkt neben/vor dem Logo");
  // Termin-buchen-Button + Sprachschalter weiterhin im Header.
  assert.ok(home.includes('tNav("bookAppointment")') && home.includes("btn-brand ml-1"), "Termin-buchen-Button fehlt im Header");
  assert.ok(home.includes("<LanguageSwitcher"), "Sprachschalter fehlt im Header");
});

// ─── 47. Pricing Copy Risk Guard ──────────────────────────────────────────────

test("Pricing Copy Risk Guard: keine MVZ-/Email-Automation-/Premium-/Trial-/ROI-Risiken in der Pricing-Copy", () => {
  const pricingPage = read("app/[locale]/pricing/page.tsx");
  // Öffentliche Pricing-Werte (DE/EN PLAN_CONTENT hardcoded) + Pricing-Message-Namespace.
  const blobs = [pricingPage];
  for (const loc of locales) blobs.push(JSON.stringify(msg(loc).pricing ?? {}));
  const blob = blobs.join("\n");
  const forbidden = [
    "MVZ",
    "German clinics",
    "EU clinics",
    "worldwide clinics",
    "Vorbereitete E-Mail-Benachrichtigungen",
    "Prepared email notifications",
    "active email automation",
    "Premium-Betriebsmodus",
    "premium operating mode",
    "Premium operating mode",
    "guaranteed ROI",
    "garantierter ROI",
    "free trial",
    "kostenlos testen",
    "Stripe checkout",
  ];
  for (const bad of forbidden) {
    assert.equal(blob.includes(bad), false, `Pricing-Copy enthält Risiko-Begriff: "${bad}"`);
  }
  // Neutrale Ersatz-Begriffe vorhanden.
  assert.ok(/Gesundheitszentren/.test(pricingPage) && /healthcare centers/.test(pricingPage), "neutrale 'Gesundheitszentren'/'healthcare centers'-Formulierung fehlt");
  assert.ok(/Benachrichtigungstexte/.test(pricingPage) && /notification templates/.test(pricingPage), "neutrale Benachrichtigungs-Formulierung fehlt");
  // Preise 29/79/149 bleiben (Einzelquelle lib/pricing.ts).
  const pr = read("lib/pricing.ts");
  for (const price of ["29", "79", "149"]) {
    assert.ok(pr.includes(price), `Preis ${price} fehlt in lib/pricing.ts`);
  }
});

// ─── 48. AI Readiness — llms.txt Guard ────────────────────────────────────────

const RISKY_AI_CLAIMS = [
  "free trial", "kostenlos testen", "guaranteed compliance", "gdpr-ready", "dsgvo-sicher",
  "hipaa-ready", "hipaa compliant", "fully compliant", "rechtssicher garantiert",
  "worldwide", "all countries", "available everywhere", "automatically confirmed",
  "automatic confirmation guaranteed", "automatisch bestätigt", "guaranteed roi",
  "real customers", "fake users", "demo-praxis", "demo clinic", "dashboard-mockup",
  "#1042", "09:00", "10:30", "patient pays", "pay now", "24h", "48h",
];

test("AI Readiness — llms.txt Guard: vorhanden, sichere Aussagen, keine riskanten Claims", () => {
  assert.ok(existsSync(join(ROOT, "public/llms.txt")), "public/llms.txt fehlt");
  const f = read("public/llms.txt");
  assert.ok(f.includes("ClinicSlotHub"), "llms.txt nennt ClinicSlotHub nicht");
  assert.ok(/no automatic appointment confirmation without approval|no automatic confirmation without practice approval/i.test(f), "llms.txt ohne manuelle-Bestätigung-Aussage");
  assert.ok(/not an emergency service/i.test(f), "llms.txt ohne 'not an emergency service'");
  assert.ok(/not a medical advice service/i.test(f), "llms.txt ohne 'not a medical advice service'");
  assert.ok(/no payment is processed on the website|does not process patient payments/i.test(f), "llms.txt ohne 'no payment on the website'");
  assert.ok(/subject to .*review|activation only after review/i.test(f), "llms.txt ohne 'activation subject to review'");
  const low = f.toLowerCase();
  for (const bad of RISKY_AI_CLAIMS) {
    assert.equal(low.includes(bad), false, `llms.txt enthält riskanten Claim: "${bad}"`);
  }
});

// ─── 49. AI Readiness — ai-summary.md Guard ───────────────────────────────────

test("AI Readiness — ai-summary.md Guard: vorhanden, Preise 29/79/149, sicher, keine riskanten Claims", () => {
  assert.ok(existsSync(join(ROOT, "public/ai-summary.md")), "public/ai-summary.md fehlt");
  const f = read("public/ai-summary.md");
  for (const p of ["29", "79", "149"]) assert.ok(f.includes(p), `ai-summary.md ohne Preis ${p}`);
  assert.ok(/manual confirmation|confirms .*manually/i.test(f), "ai-summary.md ohne manuelle Bestätigung");
  assert.ok(/no emergency service/i.test(f), "ai-summary.md ohne 'no emergency service'");
  assert.ok(/no medical advice/i.test(f), "ai-summary.md ohne 'no medical advice'");
  assert.ok(/no patient payment on the website/i.test(f), "ai-summary.md ohne 'no patient payment'");
  assert.ok(/no\W*legal or compliance guarantee/i.test(f), "ai-summary.md ohne 'keine Compliance-Garantie'");
  const low = f.toLowerCase();
  for (const bad of RISKY_AI_CLAIMS) {
    assert.equal(low.includes(bad), false, `ai-summary.md enthält riskanten Claim: "${bad}"`);
  }
});

// ─── 50. AI Readiness — JSON-LD + FAQPage Guard ───────────────────────────────

test("AI Readiness — JSON-LD Guard: Starter-Preis konsistent (29, kein 49), FAQPage + sichere Schema-Typen", () => {
  const home = read(PAGE);
  // Preis kommt aus der Pricing-Einzelquelle; kein hardcodierter 49er-Wert mehr.
  assert.equal(/price:\s*"49"/.test(home), false, "JSON-LD enthält noch hardcodierten Starter-Preis 49");
  assert.equal(home.includes("from €49"), false, "JSON-LD/Seite enthält noch '€49'");
  assert.ok(/buildSchemaOrg\(locale,\s*starterPrice/.test(home), "JSON-LD nutzt nicht die Pricing-Einzelquelle (starterPrice)");
  // Starter-Preis in lib/pricing.ts ist 29.
  assert.ok(/key:\s*"starter"[^}]*priceFrom:\s*29/.test(read("lib/pricing.ts")), "Starter-priceFrom in lib/pricing.ts ist nicht 29");
  // FAQPage + sichere Schema-Typen vorhanden, keine missverständlichen Healthcare-Betreiber-Typen.
  for (const t of ['"@type": "FAQPage"', '"@type": "SoftwareApplication"', '"@type": "Organization"', '"@type": "WebSite"']) {
    assert.ok(home.includes(t), `JSON-LD ohne ${t}`);
  }
  assert.equal(/"@type":\s*"MedicalBusiness"|"@type":\s*"Physician"|"@type":\s*"Hospital"/.test(home), false, "JSON-LD nutzt missverständlichen Healthcare-Betreiber-Typ");
});

// ─── 51. AI Readiness — Sitemap Guard ─────────────────────────────────────────

test("AI Readiness — Sitemap Guard: öffentliche Routen inkl. /termin-buchen, keine privaten Routen", () => {
  const sm = read("app/sitemap.ts");
  assert.ok(/PUBLIC_PATHS\s*=\s*\[[^\]]*"\/termin-buchen"/.test(sm), "Sitemap nimmt /termin-buchen nicht auf");
  for (const p of ['"/pricing"', '"/kontakt"']) assert.ok(sm.includes(p), `Sitemap ohne ${p}`);
  for (const priv of ['"/admin', '"/dashboard', '"/api', '"/auth']) {
    assert.equal(sm.includes(priv), false, `Sitemap enthält private Route ${priv}`);
  }
  // robots blockt private Bereiche weiter.
  const rob = read("app/robots.ts");
  for (const priv of ["/dashboard/", "/admin/", "/api/", "/auth/"]) {
    assert.ok(rob.includes(priv), `robots.ts blockt ${priv} nicht`);
  }
});

/**
 * Public Emerging Markets Positioning – Tests
 *
 * Prüft die ÖFFENTLICHE Positionierung (en + de) auf den Kernflächen:
 *   - messages/en.json + de.json (landing, pricing)
 *   - app/[locale]/page.tsx (hardcodierte JSON-LD/Meta)
 *   - app/[locale]/launch/page.tsx (en/de Copy)
 *   - app/book/[slug]/page.tsx (Patienten-Buchung)
 *
 * Pflicht: emerging healthcare markets, no patient login, WhatsApp-ready ohne API,
 * phone/reception fallback, request is not confirmation, clinic stays in control.
 * Verboten öffentlich: Soft Launch, Twilio, Resend, Stripe, provider configuration,
 * worldwide/weltweit, guaranteed, 24h/48h/instant, no paying customers, positive
 * "automatic appointment confirmation / medical decision / diagnosis upload".
 *
 * Lauf: tsx --test scripts/public-positioning.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getContinuousControlOffice, classifyCountry } from "../lib/emerging-markets-agent";
import { assertNoSecretsInResponse } from "../lib/security-agent";
import { LOCALE_QUALITY, verifiedLocales, localesNeedingReview } from "../lib/locale-quality";

const MESSAGE_LOCALES = ["en", "de", "ar", "hi", "bn", "pt", "es", "fr", "ru", "zh"];

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const en = JSON.parse(read("messages/en.json")) as Record<string, Record<string, unknown>>;
const de = JSON.parse(read("messages/de.json")) as Record<string, Record<string, unknown>>;

/** Alle String-Werte eines Objekts rekursiv zu einem Text zusammenführen. */
function flatten(obj: unknown): string {
  if (typeof obj === "string") return obj + " ";
  if (Array.isArray(obj)) return obj.map(flatten).join(" ");
  if (obj && typeof obj === "object") return Object.values(obj).map(flatten).join(" ");
  return "";
}

const enLanding = flatten(en.landing).toLowerCase();
const deLanding = flatten(de.landing).toLowerCase();
const enPricing = flatten(en.pricing).toLowerCase();
const dePricing = flatten(de.pricing).toLowerCase();

// Tokens, die in öffentlicher en/de-Copy NIRGENDS vorkommen dürfen.
const FORBIDDEN_PUBLIC = [
  "soft launch",
  "twilio",
  "resend",
  "provider configuration",
  "anbieter-konfiguration",
  "no real messages are sent",
  "trial mode",
  "no paying customers",
  "zahlenden kunden",
  "stripe",
  "worldwide",
  "weltweit",
  "doctolib",
  "guaranteed",
  "guarantee",
  "24h",
  "48h",
  "instant",
  "unlimited patients",
  "unbegrenzt patienten",
  "supabase",
];

/** Negierte Form entfernen, dann darf der positive Claim nicht übrig bleiben. */
function assertOnlyNegated(text: string, claim: string, label: string): void {
  const stripped = text.replace(
    new RegExp(`(no|not|never|kein|keine|ohne)\\s+[\\wäöü-]*\\s*${claim}`, "gi"),
    "",
  );
  assert.equal(new RegExp(claim, "i").test(stripped), false, `${label}: positiver Claim "${claim}"`);
}

// ─── Pflicht-Botschaften EN ───────────────────────────────────────────────────

test("EN landing enthält die Pflicht-Positionierung", () => {
  for (const phrase of [
    "emerging healthcare markets",
    "no patient login",
    "workflows your clinic already uses",
    "phone and reception fallback",
    "clinic stays in control",
    "simple waitlist",
    "is not an appointment confirmation",
  ]) {
    assert.ok(enLanding.includes(phrase), `EN landing fehlt: "${phrase}"`);
  }
});

test("DE landing enthält die Pflicht-Positionierung", () => {
  for (const phrase of [
    "wachstumsstarken gesundheitsmärkten",
    "kein patienten-login",
    "abläufen, die ihre klinik bereits nutzt",
    "rezeptions-fallback",
    "behält die kontrolle",
    "einfache warteliste",
    "keine terminbestätigung",
  ]) {
    assert.ok(deLanding.includes(phrase), `DE landing fehlt: "${phrase}"`);
  }
});

// ─── Verbotene öffentliche Begriffe ───────────────────────────────────────────

test("EN/DE landing enthalten keine verbotenen öffentlichen Begriffe", () => {
  for (const bad of FORBIDDEN_PUBLIC) {
    assert.equal(enLanding.includes(bad), false, `EN landing enthält "${bad}"`);
    assert.equal(deLanding.includes(bad), false, `DE landing enthält "${bad}"`);
  }
});

test("EN/DE pricing enthalten keine verbotenen öffentlichen Begriffe", () => {
  for (const bad of FORBIDDEN_PUBLIC) {
    assert.equal(enPricing.includes(bad), false, `EN pricing enthält "${bad}"`);
    assert.equal(dePricing.includes(bad), false, `DE pricing enthält "${bad}"`);
  }
});

test("Sensible Claims erscheinen nur negiert (keine positiven Versprechen)", () => {
  for (const text of [enLanding, deLanding]) {
    assertOnlyNegated(text, "automatic appointment confirmation", "landing");
    assertOnlyNegated(text, "automatic medical decision", "landing");
    assertOnlyNegated(text, "automatische terminbestätigung", "landing");
    assertOnlyNegated(text, "automatische medizinische entscheidung", "landing");
  }
});

// ─── Öffentliche Seitendateien ────────────────────────────────────────────────

test("Homepage JSON-LD/Meta ist neu positioniert (kein 'worldwide')", () => {
  const src = read("app/[locale]/page.tsx").toLowerCase();
  assert.ok(src.includes("emerging healthcare markets"), "emerging-Positionierung fehlt");
  assert.equal(src.includes("worldwide"), false, "'worldwide' noch vorhanden");
});

test("Launch-Seite: keine verbotenen englischen Tokens in en/de-Copy", () => {
  const src = read("app/[locale]/launch/page.tsx");
  for (const bad of ["Soft Launch", "now available worldwide", "weltweit verfügbar", "no paying customers", "Keine zahlenden Kunden"]) {
    assert.equal(src.includes(bad), false, `Launch enthält "${bad}"`);
  }
  assert.ok(src.includes("emerging healthcare markets"), "EN emerging-Positionierung fehlt");
  assert.ok(src.includes("wachstumsstarken Gesundheitsmärkten"), "DE emerging-Positionierung fehlt");
});

test("Booking-Seite: kein Login, Anfrage ist keine Bestätigung, keine Notfälle/Diagnosen/Dokumente", () => {
  const src = read("app/book/[slug]/page.tsx");
  assert.ok(/Kein Login nötig|Kein Konto nötig/.test(src), "Kein-Login-Hinweis fehlt");
  assert.ok(src.includes("keine verbindliche Terminbestätigung"), "Hinweis 'keine Terminbestätigung' fehlt");
  assert.ok(/Keine Notfälle, keine Diagnosen, keine Dokumente/.test(src), "Safety-Microcopy fehlt");
});

// ─── Konsistenz mit interner Governance (Phase 0) ─────────────────────────────

test("Country Control: emerging target, entwickelte Märkte blockiert", () => {
  assert.equal(classifyCountry("NG").decision, "target");
  assert.equal(classifyCountry("DE").decision, "blocked_until_legal_review");
  assert.equal(classifyCountry("US").decision, "blocked_until_legal_review");
});

test("Dauerkontroll- und Qualitätssicherungsamt bleibt GREEN", () => {
  const cc = getContinuousControlOffice();
  assert.equal(cc.status, "green");
  assert.equal(assertNoSecretsInResponse(cc), true);
});

// ─── Locale Rollout: alle 10 öffentlichen Sprachen ────────────────────────────

const VALUE_FORBIDDEN = [
  "twilio", "resend", "soft launch", "worldwide", "weltweit", "stripe",
  "provider configuration", "no real messages", "doctolib", "supabase",
  "unlimited patients", "automatically", "no paying customers",
];

test("Alle 10 Locales: landing+pricing Werte ohne verbotene öffentliche Begriffe", () => {
  for (const loc of MESSAGE_LOCALES) {
    const m = JSON.parse(read(`messages/${loc}.json`)) as Record<string, unknown>;
    const text = (flatten(m.landing) + flatten(m.pricing)).toLowerCase();
    for (const bad of VALUE_FORBIDDEN) {
      assert.equal(text.includes(bad), false, `${loc}: verbotener Begriff "${bad}"`);
    }
  }
});

test("Alle 10 Locales: WhatsApp-Kanal sichtbar, aber KEIN öffentliches 'API'-Wording", () => {
  for (const loc of MESSAGE_LOCALES) {
    const m = JSON.parse(read(`messages/${loc}.json`)) as Record<string, unknown>;
    const land = flatten(m.landing);
    const text = (land + flatten((m as { pricing?: unknown }).pricing)).toLowerCase();
    // WhatsApp als lateinische Marke ODER lokalisierte Form (z. B. arabisch "واتساب").
    assert.ok(land.toLowerCase().includes("whatsapp") || land.includes("واتساب"), `${loc}: WhatsApp-Kanal fehlt in landing`);
    // Öffentlich kein technisches API-Wording mehr.
    assert.equal(/\bapi\b/i.test(text), false, `${loc}: öffentliches 'API'-Wort gefunden`);
    assert.equal(/without api|ohne api|sans api|sin api|sem api|без api|بدون واجهة برمجية|無需 api|API के बिना|API ছাড়াই/i.test(text), false, `${loc}: 'without API'-Phrase gefunden`);
  }
});

test("Workflow-Phrase ersetzt API-Wording (en/de)", () => {
  const en = flatten((JSON.parse(read("messages/en.json")) as { landing?: unknown }).landing).toLowerCase();
  const de = flatten((JSON.parse(read("messages/de.json")) as { landing?: unknown }).landing).toLowerCase();
  assert.ok(en.includes("workflows your clinic already uses"), "EN Workflow-Phrase fehlt");
  assert.ok(de.includes("abläufen, die ihre klinik bereits nutzt"), "DE Workflow-Phrase fehlt");
});

test("Sekundär-CTA ist die Klinik-Demo (en/de)", () => {
  const en = (JSON.parse(read("messages/en.json")) as { landing?: { ctaSecondary?: string } }).landing?.ctaSecondary;
  const de = (JSON.parse(read("messages/de.json")) as { landing?: { ctaSecondary?: string } }).landing?.ctaSecondary;
  assert.equal(en, "View clinic demo");
  assert.equal(de, "Klinik-Demo ansehen");
});

// ─── Premium UI Relaunch ──────────────────────────────────────────────────────

test("Homepage rendert die neuen Premium-Sektionen (Hero-Trust, Steps, Zielgruppe, Demo-CTA)", () => {
  const src = read("app/[locale]/page.tsx");
  for (const key of ["heroTrust1", "heroTrust2", "heroTrust3", "stepsTitle", "step1", "step2", "step3", "audienceTitle", "audienceIntro", "audienceList", "demoCta"]) {
    assert.ok(src.includes(`t("${key}")`), `Homepage rendert t("${key}") nicht`);
  }
  // Aufgeräumter Hero: kein Badge-Chip und keine Trial-Doppelzeile mehr.
  assert.equal(src.includes('t("heroBadge")'), false, "heroBadge-Chip noch im Hero");
  assert.equal(src.includes('t("trialNote")'), false, "trialNote noch im Hero");
});

test("Alle 10 Locales haben Steps & Audience (Key-Parität) und kein API darin", () => {
  for (const loc of MESSAGE_LOCALES) {
    const land = (JSON.parse(read(`messages/${loc}.json`)) as { landing?: Record<string, string> }).landing ?? {};
    for (const key of ["heroTrust1", "stepsTitle", "step1", "step2", "step3", "audienceTitle", "audienceIntro", "audienceList", "demoCta"]) {
      assert.ok(typeof land[key] === "string" && land[key].length > 0, `${loc}: Key ${key} fehlt`);
    }
    const blob = ["step1", "step2", "step3", "heroTrust1", "heroTrust2", "heroTrust3"].map((k) => land[k]).join(" ");
    assert.equal(/\bapi\b/i.test(blob), false, `${loc}: API in Steps/Hero-Trust`);
  }
});

test("Zielgruppen-Sektion nennt Klinik-Typen (en/de)", () => {
  const en = (JSON.parse(read("messages/en.json")) as { landing?: { audienceList?: string } }).landing?.audienceList?.toLowerCase() ?? "";
  const de = (JSON.parse(read("messages/de.json")) as { landing?: { audienceList?: string } }).landing?.audienceList?.toLowerCase() ?? "";
  for (const term of ["dental", "medical", "outpatient", "therapy"]) assert.ok(en.includes(term), `EN audience fehlt: ${term}`);
  for (const term of ["zahn", "medizin", "ambulant", "therapie"]) assert.ok(de.includes(term), `DE audience fehlt: ${term}`);
});

test("Workflow-Schritte nennen WhatsApp/Telefon/Rezeption als Workflow (en/de)", () => {
  const en = ((JSON.parse(read("messages/en.json")) as { landing?: { step1?: string } }).landing?.step1 ?? "").toLowerCase();
  const de = ((JSON.parse(read("messages/de.json")) as { landing?: { step1?: string } }).landing?.step1 ?? "").toLowerCase();
  assert.ok(en.includes("whatsapp") && en.includes("phone") && en.includes("reception"), "EN step1 Kanäle fehlen");
  assert.ok(de.includes("whatsapp") && de.includes("telefon") && de.includes("rezeption"), "DE step1 Kanäle fehlen");
});

test("Footer-Label: Patientenanfrage statt 'Termin buchen'/'Book Appointment' (Rollen-Klarheit)", () => {
  for (const loc of MESSAGE_LOCALES) {
    const nav = (JSON.parse(read(`messages/${loc}.json`)) as { nav?: Record<string, string> }).nav ?? {};
    assert.equal(/termin buchen|book appointment/i.test(nav.bookAppointment ?? ""), false, `${loc}: alte Booking-Buchung-Sprache im Footer-Label`);
  }
  const en = (JSON.parse(read("messages/en.json")) as { nav: { bookAppointment: string } }).nav.bookAppointment;
  const de = (JSON.parse(read("messages/de.json")) as { nav: { bookAppointment: string } }).nav.bookAppointment;
  assert.equal(en, "Patient request");
  assert.equal(de, "Patientenanfrage");
});

test("Blog öffentlich als 'Clinic Guides' / 'Ratgeber' (nicht generischer Blog)", () => {
  const en = JSON.parse(read("messages/en.json")) as { nav: { blog: string }; blog: { title: string } };
  const de = JSON.parse(read("messages/de.json")) as { nav: { blog: string }; blog: { title: string } };
  assert.equal(en.nav.blog, "Clinic Guides");
  assert.equal(en.blog.title, "Clinic Guides");
  assert.ok(de.nav.blog.includes("Ratgeber") && de.blog.title.includes("Ratgeber"), "DE Blog-Rename fehlt");
  assert.notEqual(en.nav.blog, "Blog");
});

test("Blog/Ratgeber (lib/blog-data.ts): keine alten/verbotenen öffentlichen Begriffe", () => {
  const src = read("lib/blog-data.ts");
  for (const re of [
    /soft launch/i, /\btwilio\b/i, /\bstripe\b/i, /\bsupabase\b/i, /\bresend\b/i,
    /kostenlos testen/i, /14 Tage kostenlos/i, /free trial/i, /try for free/i,
    /\bweltweit\b/i, /\bworldwide\b/i, /no paying customers/i,
  ]) {
    assert.equal(re.test(src), false, `blog-data enthält verbotenen Begriff: ${re}`);
  }
});

test("Öffentliche Botschaft frei von internen Governance-/Technik-Begriffen (messages + Kernseiten)", () => {
  const targets = [
    "messages/en.json", "messages/de.json",
    "app/[locale]/page.tsx", "app/[locale]/launch/page.tsx", "app/[locale]/pricing/page.tsx",
  ];
  // Nur landing/pricing/contact/nav der messages prüfen (interne admin-Namespaces sind erlaubt).
  const internal = [/market proof/i, /phase 0/i, /zero-cost/i, /governance/i, /provider configuration/i, /no real messages/i];
  for (const f of targets) {
    let src: string;
    if (f.endsWith(".json")) {
      const m = JSON.parse(read(f)) as Record<string, unknown>;
      src = flatten(m.landing) + flatten(m.pricing) + flatten(m.contact) + flatten(m.nav);
    } else {
      src = read(f);
    }
    for (const re of internal) {
      assert.equal(re.test(src), false, `${f}: interner Begriff öffentlich (${re})`);
    }
  }
});

test("Öffentliche Launch-/Share-Seiten: keine verbotenen Begriffe", () => {
  const files = [
    "app/[locale]/launch/page.tsx",
    "app/[locale]/public-launch/page.tsx",
    "app/[locale]/share/page.tsx",
  ];
  const bad = ["Soft Launch", "soft launch", "Twilio", "Resend", "Supabase", "worldwide", "weltweit", "no paying customers", "zahlenden Kunden", "mondial", "monde entier", "todo el mundo", "todo o mundo"];
  for (const f of files) {
    const src = read(f);
    for (const b of bad) {
      assert.equal(src.includes(b), false, `${f}: enthält "${b}"`);
    }
  }
});

// ─── Linguistic Quality Registry (Ehrlichkeit) ────────────────────────────────

test("Linguistic Quality Registry deckt alle Message-Locales ab", () => {
  for (const loc of MESSAGE_LOCALES) {
    assert.ok(LOCALE_QUALITY.some((l) => l.locale === loc), `Registry fehlt: ${loc}`);
  }
});

test("Nur en/de gelten als verified; die 8 anderen brauchen Review", () => {
  assert.deepEqual(verifiedLocales().sort(), ["de", "en"]);
  const review = localesNeedingReview().sort();
  assert.deepEqual(review, ["ar", "bn", "es", "fr", "hi", "pt", "ru", "zh"]);
});

// ─── Homepage-Banner (app/[locale]/page.tsx) ──────────────────────────────────

const HOMEPAGE_FORBIDDEN = [
  /soft launch/i,
  /global public soft launch/i,
  /globalen öffentlichen/i,
  /kostenlos testen/i,
  /try it for free/i,
  /try for free/i,
  /lancement public mondial/i,
  /lanzamiento público global/i,
  /lançamento público global/i,
  /公开软启动/,
  /\bworldwide\b/i,
  /\bweltweit\b/i,
  /\btwilio\b/i,
  /\bresend\b/i,
  /provider configuration/i,
  /no paying customers/i,
  /unlimited patients/i,
  /\bguaranteed\b/i,
  /\b24\s*h\b/i,
  /\b48\s*h\b/i,
  /\binstant\b/i,
  /trial mode/i,
];

test("Homepage (app/[locale]/page.tsx) enthält keine verbotenen öffentlichen Begriffe", () => {
  const src = read("app/[locale]/page.tsx");
  for (const re of HOMEPAGE_FORBIDDEN) {
    assert.equal(re.test(src), false, `Homepage enthält verbotenen Begriff: ${re}`);
  }
});

test("Homepage-Banner trägt Emerging-Markets-Positionierung (en/de)", () => {
  const src = read("app/[locale]/page.tsx");
  assert.ok(src.includes("emerging healthcare markets"), "EN Emerging-Positionierung fehlt im Banner");
  assert.ok(src.includes("wachstumsstarken Gesundheitsmärkten"), "DE Emerging-Positionierung fehlt im Banner");
});

// ─── Header-/Nav-CTA (nav.getStarted) ─────────────────────────────────────────

// Trial-/Free-Test-Sprache, die im sichtbaren nav-Namespace verboten ist.
const NAV_FORBIDDEN = /kostenlos|gratis|gratuit|free trial|free test|try for free|\btrial\b|teste grátis|prueba gratis|免费试用|免费|निःशुल्क|مجان|бесплатно|বিনামূল্যে|soft launch|no paying customers/i;

const EXPECTED_GET_STARTED: Record<string, string> = {
  en: "Request access",
  de: "Zugang anfragen",
  fr: "Demander l'accès",
  es: "Solicitar acceso",
  pt: "Solicitar acesso",
  ar: "طلب الوصول",
  hi: "पहुँच का अनुरोध करें",
  bn: "অ্যাক্সেসের অনুরোধ করুন",
  ru: "Запросить доступ",
  zh: "申请访问权限",
};

test("nav-Namespace aller 10 Locales ohne Trial-/Free-Test-Sprache", () => {
  for (const loc of MESSAGE_LOCALES) {
    const m = JSON.parse(read(`messages/${loc}.json`)) as Record<string, unknown>;
    const navText = flatten((m as { nav?: unknown }).nav);
    assert.equal(NAV_FORBIDDEN.test(navText), false, `${loc}: nav enthält Trial-/Free-Sprache`);
  }
});

test("nav.getStarted ist in allen 10 Locales die neutrale Zugang-anfragen-CTA", () => {
  for (const loc of MESSAGE_LOCALES) {
    const m = JSON.parse(read(`messages/${loc}.json`)) as { nav?: { getStarted?: string } };
    const v = m.nav?.getStarted ?? "";
    assert.equal(NAV_FORBIDDEN.test(v), false, `${loc}: getStarted trägt Trial-Sprache ("${v}")`);
    assert.equal(v, EXPECTED_GET_STARTED[loc], `${loc}: getStarted nicht die erwartete Request-Access-CTA`);
  }
});

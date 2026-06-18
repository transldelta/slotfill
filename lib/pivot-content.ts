/**
 * Pivot content — ClinicSlotHub as International Clinic Visibility Engine.
 *
 * READ-ONLY copy data. DE/EN are the professional, reviewed languages.
 * Other locales fall back to EN (safe neutral) — no machine-translated rollout.
 *
 * ClinicSlotHub is NOT a medical provider, booking platform or middleman.
 * No medical advice, no result guarantees, no patient data, no payment.
 */

export interface PivotDict {
  brand: string;
  tagline: string;
  nav: { home: string; forClinics: string; treatments: string; destinations: string; safety: string; contact: string };
  cta: { requestReview: string; contact: string; viewTreatments: string; forClinics: string };
  hero: { eyebrow: string; title: string; subline: string; trust: string[] };
  demoNote: string;
  demoCards: { name: string; category: string; region: string }[];
  treatmentsTitle: string;
  treatmentsIntro: string;
  treatments: string[];
  destinationsTitle: string;
  destinationsIntro: string;
  destinations: string[];
  forClinics: { title: string; intro: string; points: string[]; notList: string[] };
  safety: { title: string; intro: string; points: string[] };
  contact: { title: string; intro: string; points: string[]; note: string };
  footerNote: string;
  rights: string;
}

const EN: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "International Clinic Visibility Engine",
  nav: { home: "Home", forClinics: "For clinics", treatments: "Treatments", destinations: "Regions", safety: "Safety notes", contact: "Contact" },
  cta: { requestReview: "Request visibility review", contact: "Contact us", viewTreatments: "View treatment areas", forClinics: "For clinics" },
  hero: {
    eyebrow: "For private, self-pay clinics",
    title: "International visibility for private clinics. Direct contact for patients.",
    subline:
      "ClinicSlotHub helps private clinics become visible to international patients. Patients contact clinics directly. No medical advice, no booking, no middleman.",
    trust: ["Patients contact clinics directly", "No medical advice", "No booking, no payment through us"],
  },
  demoNote: "The cards below are generic examples for layout only — not real clinics and not endorsements.",
  demoCards: [
    { name: "Example Clinic A", category: "Hair Transplant", region: "Region A" },
    { name: "Example Clinic B", category: "Dental Implants", region: "Region B" },
    { name: "Example Clinic C", category: "Eye Laser", region: "Region C" },
  ],
  treatmentsTitle: "Treatment areas",
  treatmentsIntro: "Neutral categories that clinics can present. ClinicSlotHub gives no medical advice and recommends no treatment.",
  treatments: ["Hair Transplant", "Dental Implants", "Veneers", "Aesthetic Surgery", "Eye Laser", "Dermatology & Laser", "Diagnostics & Check-ups", "Longevity / Preventive Health", "Orthopedics / Sports Medicine"],
  destinationsTitle: "Clinic regions",
  destinationsIntro: "Provider regions where private clinics operate. This is not travel advice and not a medical recommendation.",
  destinations: ["Turkey", "Morocco", "Tunisia", "Egypt", "Thailand", "India", "Mexico", "Colombia"],
  forClinics: {
    title: "For private clinics",
    intro: "Become visible to international self-pay patients and let them contact you directly. You stay fully responsible for medical quality, pricing and care.",
    points: [
      "Present your treatment areas to international patients",
      "Show clear, direct contact options",
      "The clinic stays responsible for quality, risks, pricing and aftercare",
      "Visibility only — ClinicSlotHub does not treat, book or take payment",
    ],
    notList: [
      "No booking platform",
      "No commission per treatment",
      "No patient payments through ClinicSlotHub",
      "No medical recommendation by ClinicSlotHub",
    ],
  },
  safety: {
    title: "Safety notes",
    intro: "Please read carefully. ClinicSlotHub provides visibility only.",
    points: [
      "ClinicSlotHub gives no medical advice and no treatment recommendation.",
      "There is no result guarantee and no quality guarantee.",
      "This is not an emergency platform.",
      "Patients contact clinics directly.",
      "Patients must check qualification, risks, aftercare, prices and contracts directly with the clinic.",
      "Medical responsibility lies with the clinic and the treating professional.",
    ],
  },
  contact: {
    title: "Contact",
    intro: "A simple way for private clinics to get in touch about visibility. For clinics only — not a patient treatment form.",
    points: [
      "No patient health data, no diagnosis text, no uploads",
      "No automatic forwarding to clinics",
      "We reply to clinic enquiries about visibility",
    ],
    note: "Patients: please contact the clinic of your choice directly. ClinicSlotHub does not arrange treatment.",
  },
  footerNote: "ClinicSlotHub is a visibility platform for private clinics. No medical advice, no booking, no payment, no patient data.",
  rights: "All rights reserved.",
};

const DE: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "International Clinic Visibility Engine",
  nav: { home: "Start", forClinics: "Für Kliniken", treatments: "Behandlungen", destinations: "Regionen", safety: "Sicherheitshinweise", contact: "Kontakt" },
  cta: { requestReview: "Sichtbarkeits-Prüfung anfragen", contact: "Kontakt aufnehmen", viewTreatments: "Behandlungsbereiche ansehen", forClinics: "Für Kliniken" },
  hero: {
    eyebrow: "Für private Selbstzahler-Kliniken",
    title: "Internationale Sichtbarkeit für private Kliniken. Direkter Kontakt für Patienten.",
    subline:
      "ClinicSlotHub macht private Kliniken für internationale Patienten sichtbar. Patienten kontaktieren Kliniken direkt. Keine medizinische Beratung, keine Buchung, kein Mittelsmann.",
    trust: ["Patienten kontaktieren Kliniken direkt", "Keine medizinische Beratung", "Keine Buchung, keine Zahlung über uns"],
  },
  demoNote: "Die folgenden Karten sind generische Beispiele nur für das Layout — keine echten Kliniken und keine Empfehlung.",
  demoCards: [
    { name: "Beispiel-Klinik A", category: "Haartransplantation", region: "Region A" },
    { name: "Beispiel-Klinik B", category: "Zahnimplantate", region: "Region B" },
    { name: "Beispiel-Klinik C", category: "Augenlaser", region: "Region C" },
  ],
  treatmentsTitle: "Behandlungsbereiche",
  treatmentsIntro: "Neutrale Kategorien, die Kliniken präsentieren können. ClinicSlotHub gibt keine medizinische Beratung und empfiehlt keine Behandlung.",
  treatments: ["Haartransplantation", "Zahnimplantate", "Veneers", "Ästhetische Chirurgie", "Augenlaser", "Dermatologie & Laser", "Diagnostik & Check-ups", "Longevity / Präventivmedizin", "Orthopädie / Sportmedizin"],
  destinationsTitle: "Klinik-Regionen",
  destinationsIntro: "Anbieterregionen, in denen private Kliniken tätig sind. Dies ist keine Reiseberatung und keine medizinische Empfehlung.",
  destinations: ["Türkei", "Marokko", "Tunesien", "Ägypten", "Thailand", "Indien", "Mexiko", "Kolumbien"],
  forClinics: {
    title: "Für private Kliniken",
    intro: "Werden Sie für internationale Selbstzahler sichtbar und lassen Sie sich direkt kontaktieren. Die Klinik bleibt voll verantwortlich für medizinische Qualität, Preise und Versorgung.",
    points: [
      "Präsentieren Sie Ihre Behandlungsbereiche internationalen Patienten",
      "Zeigen Sie klare, direkte Kontaktwege",
      "Die Klinik bleibt verantwortlich für Qualität, Risiken, Preise und Nachsorge",
      "Nur Sichtbarkeit — ClinicSlotHub behandelt nicht, bucht nicht und nimmt kein Geld",
    ],
    notList: [
      "Keine Buchungsplattform",
      "Keine Provision pro Behandlung",
      "Keine Patientenzahlungen über ClinicSlotHub",
      "Keine medizinische Empfehlung durch ClinicSlotHub",
    ],
  },
  safety: {
    title: "Sicherheitshinweise",
    intro: "Bitte sorgfältig lesen. ClinicSlotHub bietet ausschließlich Sichtbarkeit.",
    points: [
      "ClinicSlotHub gibt keine medizinische Beratung und keine Behandlungsempfehlung.",
      "Es gibt keine Ergebnisgarantie und keine Qualitätsgarantie.",
      "Dies ist keine Notfallplattform.",
      "Patienten kontaktieren Kliniken direkt.",
      "Patienten müssen Qualifikation, Risiken, Nachsorge, Preise und Verträge direkt mit der Klinik prüfen.",
      "Die medizinische Verantwortung liegt bei der Klinik und dem behandelnden Fachpersonal.",
    ],
  },
  contact: {
    title: "Kontakt",
    intro: "Eine einfache Möglichkeit für private Kliniken, uns zur Sichtbarkeit zu kontaktieren. Nur für Kliniken — kein Patienten-Behandlungsformular.",
    points: [
      "Keine Patienten-Gesundheitsdaten, kein Diagnosetext, keine Uploads",
      "Keine automatische Weiterleitung an Kliniken",
      "Wir antworten auf Klinik-Anfragen zur Sichtbarkeit",
    ],
    note: "Patienten: Bitte kontaktieren Sie die Klinik Ihrer Wahl direkt. ClinicSlotHub vermittelt keine Behandlung.",
  },
  footerNote: "ClinicSlotHub ist eine Sichtbarkeitsplattform für private Kliniken. Keine medizinische Beratung, keine Buchung, keine Zahlung, keine Patientendaten.",
  rights: "Alle Rechte vorbehalten.",
};

const DICTS: Record<string, PivotDict> = { en: EN, de: DE };

/** DE/EN professionell; alle anderen Locales sicher auf EN (kein KI-Rollout). */
export function getPivot(locale: string): PivotDict {
  return DICTS[locale] ?? EN;
}

/** Alle öffentlichen Copy-Strings einer Sprache flach (für Safety-Scan/Tests). */
export function flattenPivot(d: PivotDict): string {
  return JSON.stringify(d);
}

/** Premium-Farbwelt: Navy / Creme / Gold / dezentes Grün. */
export const PIVOT_COLORS = {
  navy: "#0B1F3A",
  navySoft: "#13294B",
  cream: "#F7F2E7",
  creamSoft: "#FBF7EE",
  gold: "#C2A14A",
  goldSoft: "#D8BD78",
  green: "#2F6F5E",
  ink: "#1A2433",
} as const;

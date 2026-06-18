/**
 * Safety Control Tower — ClinicSlotHub Visibility-Engine-Pivot.
 *
 * READ-ONLY reine Logik. Keine externen Aufrufe, keine Secrets, keine DB.
 *
 * Zweck: Öffentliche Copy auf verbotene Claims prüfen. ClinicSlotHub bleibt
 * ausdrücklich raus aus Medizin, Buchung, Zahlung und Behandlung:
 * keine medizinische Empfehlung, keine Ergebnisgarantie, keine Buchung,
 * keine Provision pro Behandlung, keine Fake-Kliniken/-Bewertungen/-Siegel.
 */

/** Verbotene öffentliche Claims (Marketing/Trust/Hero/CTA). */
export const FORBIDDEN_CLAIMS: ReadonlyArray<RegExp> = [
  /\bbest clinic\b/i,
  /\bsafest clinic\b/i,
  /\bguaranteed result/i,
  /\brisk[-\s]?free\b/i,
  /\bcheapest surgery\b/i,
  /\bcheap surgery\b/i,
  /\bbook surgery now\b/i,
  /\bmedical recommendation\b/i,
  /\bwe recommend this clinic\b/i,
  /\bverified medical quality\b/i,
  /\bguaranteed patients\b/i,
  /\bguaranteed revenue\b/i,
  /\bpatient pays clinicslothub\b/i,
  /\bcommission per surgery\b/i,
  /\bno risk\b/i,
  /\binstant treatment booking\b/i,
  /\bbook (your )?(surgery|treatment|operation)\b/i,
];

/** Begriffe, die auf verbotene Produktlogik in Phase 1 hindeuten (Public-Seiten). */
export const FORBIDDEN_PRODUCT_LOGIC: ReadonlyArray<RegExp> = [
  /\bpatient login\b/i,
  /\bpatient account\b/i,
  /\bupload (your )?(photo|x-?ray|scan|document)/i,
  /\bdiagnosis form\b/i,
  /\bbook (an )?appointment\b/i,
  /\bpay (now|online|with card)\b/i,
];

export interface SafetyScanResult {
  status: "green" | "red";
  violations: Array<{ pattern: string; context: string }>;
}

const NEGATION = /\b(no|not|never|without|kein|keine|ohne|nicht|isn'?t|are not|is not|gives no|no result)\b/i;

/**
 * Scant einen Text auf verbotene Claims/Produktlogik.
 * Negierte Disclaimer (z. B. "not a medical recommendation", "no result guarantee")
 * sind ausdrücklich erlaubt und werden nicht als Verstoß gewertet.
 */
export function scanPublicCopy(text: string): SafetyScanResult {
  const violations: SafetyScanResult["violations"] = [];
  const all = [...FORBIDDEN_CLAIMS, ...FORBIDDEN_PRODUCT_LOGIC];
  for (const re of all) {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    const rx = new RegExp(re.source, flags);
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      const before = text.slice(Math.max(0, m.index - 24), m.index);
      if (NEGATION.test(before)) continue; // erlaubte Negation/Disclaimer
      const idx = Math.max(0, m.index - 30);
      violations.push({ pattern: String(re), context: text.slice(idx, m.index + m[0].length + 20).replace(/\s+/g, " ") });
      break;
    }
  }
  return { status: violations.length === 0 ? "green" : "red", violations };
}

/** Pflicht-Safety-Aussagen, die öffentlich klar gemacht werden müssen. */
export const REQUIRED_SAFETY_STATEMENTS = {
  en: [
    "No medical advice",
    "No treatment recommendation",
    "No result guarantee",
    "Patients contact clinics directly",
    "Medical responsibility lies with the clinic",
  ],
  de: [
    "Keine medizinische Beratung",
    "Keine Behandlungsempfehlung",
    "Keine Ergebnisgarantie",
    "Patienten kontaktieren Kliniken direkt",
    "Die medizinische Verantwortung liegt bei der Klinik",
  ],
} as const;

/** Kernpositionierung als Datensatz (für Tests/CEO-Tower). */
export const POSITIONING = {
  code: "CLINIC_VISIBILITY_ENGINE",
  isMedicalProvider: false,
  isBookingPlatform: false,
  storesPatientData: false,
  takesPayment: false,
  commissionPerTreatment: false,
} as const;

/** Aggregierter Safety-Tower-Status über eine Liste öffentlicher Copy-Texte. */
export function runSafetyTower(sources: string[]): SafetyScanResult {
  const merged = sources.join("\n");
  return scanPublicCopy(merged);
}

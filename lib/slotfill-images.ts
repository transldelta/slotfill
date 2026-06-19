/**
 * Slotfill – Healthcare-Bild-Slots (Editorial-Bildflächen der Startseite).
 *
 * Diese Datei ist die zentrale Schaltstelle für die echten Praxis-/Klinikfotos.
 * Solange `enabled: false` ist, rendert <HealthcareImage> eine hochwertige,
 * markenkonforme Platzhalterfläche – es wird KEIN Bild angefragt (keine 404,
 * keine Console-Errors).
 *
 * Echtes Foto später einbauen (pro Slot, ohne Code-Umbau):
 *   1. Lizenzsicheres Foto unter public/images/slotfill/<file> ablegen.
 *      (Eigene Aufnahmen, gekaufte Stock-Lizenz oder klar lizenzfreie Quelle.
 *       KEINE Hotlinks, KEINE fremden Kliniklogos, KEINE Fake-Testimonials,
 *       KEINE echten Patientendaten.)
 *   2. Hier `enabled: true` setzen.
 *
 * Empfohlene Seitenverhältnisse / Mindestgrößen siehe README in
 * public/images/slotfill/.
 */

export const SLOTFILL_IMAGE_DIR = "/images/slotfill";

export type SlotfillImageKey =
  | "heroDoctorConsultation"
  | "patientMobileBooking"
  | "clinicReception"
  | "clinicTeam"
  | "dentalConsultation"
  | "therapySession"
  | "healthcareTrust";

export interface SlotfillImageMeta {
  /** Dateiname unter public/images/slotfill/ */
  file: string;
  /** true → echtes Foto wird gerendert; false → markenkonformer Platzhalter */
  enabled: boolean;
}

export const SLOTFILL_IMAGES: Record<SlotfillImageKey, SlotfillImageMeta> = {
  heroDoctorConsultation: { file: "hero-doctor-consultation.png", enabled: false },
  patientMobileBooking: { file: "patient-mobile-booking.png", enabled: false },
  clinicReception: { file: "clinic-reception.png", enabled: false },
  clinicTeam: { file: "clinic-team.png", enabled: false },
  dentalConsultation: { file: "dental-consultation.png", enabled: false },
  therapySession: { file: "therapy-session.png", enabled: false },
  healthcareTrust: { file: "healthcare-trust.png", enabled: false },
};

export function slotfillImageSrc(key: SlotfillImageKey): string {
  return `${SLOTFILL_IMAGE_DIR}/${SLOTFILL_IMAGES[key].file}`;
}

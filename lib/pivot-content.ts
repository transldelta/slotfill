/**
 * Public product content — ClinicSlotHub: Modern Clinic Scheduling OS.
 *
 * READ-ONLY copy data. Public product languages: EN (main), FR, ES.
 * No German public product copy. No external services, no patient data,
 * no medical advice, no payment, no booking storage. Static demo only.
 */

export interface PivotDict {
  brand: string;
  tagline: string;
  nav: { home: string; howItWorks: string; demo: string; forClinics: string; safety: string };
  cta: { requestAccess: string; viewDemo: string; pilotAccess: string; contact: string };
  hero: { h1: string; subline: string; supporting: string; trust: string };
  mockup: {
    todayBoard: string; appointments: string; walkInQueue: string; availableSlots: string;
    rooms: string; services: string; quickActions: string; stats: string; mobilePreview: string;
    waiting: string; inProgress: string; completed: string; available: string;
  };
  forClinics: { title: string; intro: string; points: string[] };
  forPatients: { title: string; intro: string; points: string[] };
  howItWorks: { title: string; steps: string[] };
  demo: { title: string; intro: string; notes: string[] };
  pricing: { title: string; note: string };
  safety: { title: string; body: string };
  footerNote: string;
  rights: string;
}

const EN: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Home", howItWorks: "How it works", demo: "Demo", forClinics: "For clinics", safety: "Safety" },
  cta: { requestAccess: "Request access", viewDemo: "View demo", pilotAccess: "Pilot access on request", contact: "Contact" },
  hero: {
    h1: "ClinicSlotHub — Modern Clinic Scheduling OS",
    subline: "Simple scheduling, walk-in queue and daily slot management for clinics.",
    supporting: "Plan appointments, walk-ins, rooms and available slots in one simple board — without heavy hospital software.",
    trust: "A clean scheduling workspace for clinics that need clarity, not complexity.",
  },
  mockup: {
    todayBoard: "Today board", appointments: "Appointments", walkInQueue: "Walk-in queue", availableSlots: "Available slots",
    rooms: "Rooms", services: "Services", quickActions: "Quick actions", stats: "Today", mobilePreview: "Mobile preview",
    waiting: "Waiting", inProgress: "In progress", completed: "Completed", available: "Available",
  },
  forClinics: {
    title: "A calmer way to run the clinic day.",
    intro: "Keep the daily schedule, appointments, walk-ins, rooms and services organized in one simple board.",
    points: ["Daily schedule at a glance", "Appointments and walk-ins together", "Rooms and services overview", "Front desk clarity", "Simple operation — no heavy enterprise system"],
  },
  forPatients: {
    title: "Simple status, clear timing, less confusion.",
    intro: "Patients see only what they need — no accounts, no medical data.",
    points: ["Queue number", "Appointment time", "Room status", "General visit category"],
  },
  howItWorks: {
    title: "How it works",
    steps: ["Set the day's schedule", "Add appointments and walk-ins", "Manage rooms, services and availability", "Keep the clinic day organized"],
  },
  demo: {
    title: "View the demo",
    intro: "A static demo with anonymized sample data.",
    notes: ["Static demo — anonymized sample data", "No real patient data", "No medical records", "No payment processing", "No uploads"],
  },
  pricing: { title: "Pricing", note: "Pricing is prepared for pilot access and will be confirmed before activation." },
  safety: {
    title: "Safety",
    body: "ClinicSlotHub is not a medical advice tool. It does not provide diagnosis, treatment recommendations or emergency services. The MVP does not store medical records, accept medical uploads or process patient payments. Clinics remain responsible for their own medical, legal and operational processes.",
  },
  footerNote: "ClinicSlotHub is a lightweight clinic scheduling tool. No medical advice, no diagnosis, no patient records, no payment.",
  rights: "All rights reserved.",
};

const FR: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Accueil", howItWorks: "Comment ça marche", demo: "Démo", forClinics: "Pour les cliniques", safety: "Sécurité" },
  cta: { requestAccess: "Demander l'accès", viewDemo: "Voir la démo", pilotAccess: "Accès pilote sur demande", contact: "Contact" },
  hero: {
    h1: "ClinicSlotHub — Modern Clinic Scheduling OS",
    subline: "Planification simple des rendez-vous, de la file d'attente et des créneaux quotidiens pour les cliniques.",
    supporting: "Organisez les rendez-vous, les arrivées sans rendez-vous, les salles et les créneaux disponibles dans un tableau clair — sans logiciel hospitalier lourd.",
    trust: "Un espace de planification clair pour les cliniques qui ont besoin de simplicité, pas de complexité.",
  },
  mockup: {
    todayBoard: "Tableau du jour", appointments: "Rendez-vous", walkInQueue: "File d'attente", availableSlots: "Créneaux disponibles",
    rooms: "Salles", services: "Services", quickActions: "Actions rapides", stats: "Aujourd'hui", mobilePreview: "Aperçu mobile",
    waiting: "En attente", inProgress: "En cours", completed: "Terminé", available: "Disponible",
  },
  forClinics: {
    title: "Une façon plus claire d'organiser la journée de la clinique.",
    intro: "Gardez le planning du jour, les rendez-vous, les arrivées, les salles et les services organisés dans un tableau simple.",
    points: ["Planning du jour en un coup d'œil", "Rendez-vous et arrivées réunis", "Vue des salles et des services", "Clarté à l'accueil", "Fonctionnement simple — sans système d'entreprise lourd"],
  },
  forPatients: {
    title: "Un statut simple, des horaires clairs, moins de confusion.",
    intro: "Les patients voient seulement l'essentiel — sans compte, sans données médicales.",
    points: ["Numéro de file", "Heure du rendez-vous", "Statut de la salle", "Catégorie de visite générale"],
  },
  howItWorks: {
    title: "Comment ça marche",
    steps: ["Préparez le planning du jour", "Ajoutez les rendez-vous et les arrivées sans rendez-vous", "Gérez les salles, les services et les disponibilités", "Gardez la journée organisée"],
  },
  demo: {
    title: "Voir la démo",
    intro: "Une démo statique avec des données d'exemple anonymisées.",
    notes: ["Démo statique — données d'exemple anonymisées", "Aucune donnée patient réelle", "Aucun dossier médical", "Aucun paiement", "Aucun téléversement"],
  },
  pricing: { title: "Tarifs", note: "Les tarifs sont préparés pour l'accès pilote et seront confirmés avant activation." },
  safety: {
    title: "Sécurité",
    body: "ClinicSlotHub n'est pas un outil de conseil médical. Il ne fournit pas de diagnostic, de recommandation de traitement ni de service d'urgence. Le MVP ne stocke pas de dossier médical, n'accepte pas de téléversement médical et ne traite pas les paiements des patients. Les cliniques restent responsables de leurs propres processus médicaux, juridiques et opérationnels.",
  },
  footerNote: "ClinicSlotHub est un outil léger de planification pour cliniques. Pas de conseil médical, pas de diagnostic, pas de dossier patient, pas de paiement.",
  rights: "Tous droits réservés.",
};

const ES: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Inicio", howItWorks: "Cómo funciona", demo: "Demo", forClinics: "Para clínicas", safety: "Seguridad" },
  cta: { requestAccess: "Solicitar acceso", viewDemo: "Ver demo", pilotAccess: "Acceso piloto a pedido", contact: "Contacto" },
  hero: {
    h1: "ClinicSlotHub — Modern Clinic Scheduling OS",
    subline: "Planificación simple de citas, turnos sin reserva y gestión diaria de horarios para clínicas.",
    supporting: "Organice citas, llegadas sin reserva, salas y horarios disponibles en un panel claro — sin software hospitalario complejo.",
    trust: "Un espacio de planificación claro para clínicas que necesitan simplicidad, no complejidad.",
  },
  mockup: {
    todayBoard: "Panel del día", appointments: "Citas", walkInQueue: "Fila sin reserva", availableSlots: "Horarios disponibles",
    rooms: "Salas", services: "Servicios", quickActions: "Acciones rápidas", stats: "Hoy", mobilePreview: "Vista móvil",
    waiting: "En espera", inProgress: "En curso", completed: "Completado", available: "Disponible",
  },
  forClinics: {
    title: "Una forma más clara de organizar el día de la clínica.",
    intro: "Mantenga el horario del día, las citas, las llegadas, las salas y los servicios organizados en un panel simple.",
    points: ["Horario del día de un vistazo", "Citas y llegadas juntas", "Vista de salas y servicios", "Claridad en recepción", "Operación simple — sin sistema empresarial complejo"],
  },
  forPatients: {
    title: "Estado simple, horarios claros y menos confusión.",
    intro: "Los pacientes ven solo lo necesario — sin cuentas, sin datos médicos.",
    points: ["Número de fila", "Hora de la cita", "Estado de la sala", "Categoría de visita general"],
  },
  howItWorks: {
    title: "Cómo funciona",
    steps: ["Prepare el horario del día", "Añada citas y llegadas sin reserva", "Gestione salas, servicios y disponibilidad", "Mantenga el día organizado"],
  },
  demo: {
    title: "Ver la demo",
    intro: "Una demo estática con datos de ejemplo anonimizados.",
    notes: ["Demo estática — datos de ejemplo anonimizados", "Sin datos reales de pacientes", "Sin historiales médicos", "Sin procesamiento de pagos", "Sin cargas de archivos"],
  },
  pricing: { title: "Precios", note: "Los precios están preparados para el acceso piloto y se confirmarán antes de la activación." },
  safety: {
    title: "Seguridad",
    body: "ClinicSlotHub no es una herramienta de asesoramiento médico. No proporciona diagnósticos, recomendaciones de tratamiento ni servicios de emergencia. El MVP no almacena historiales médicos, no acepta cargas de documentos médicos y no procesa pagos de pacientes. Las clínicas siguen siendo responsables de sus propios procesos médicos, legales y operativos.",
  },
  footerNote: "ClinicSlotHub es una herramienta ligera de planificación para clínicas. Sin asesoramiento médico, sin diagnóstico, sin historiales de pacientes, sin pagos.",
  rights: "Todos los derechos reservados.",
};

const DICTS: Record<string, PivotDict> = { en: EN, fr: FR, es: ES };

/** Public product languages: EN/FR/ES. Any other locale falls back to EN. */
export function getPivot(locale: string): PivotDict {
  return DICTS[locale] ?? EN;
}

/** Active public product locales (Sitemap/Nav/Routing-Gate). */
export const PRODUCT_LOCALES = ["en", "fr", "es"] as const;

/** Alle öffentlichen Copy-Strings einer Sprache flach (für Safety-Scan/Tests). */
export function flattenPivot(d: PivotDict): string {
  return JSON.stringify(d);
}

/** Anonymisierte Mockup-Beispieldaten — keine Namen, keine PII. */
export const MOCK_ROWS = [
  { id: "Appointment #1042", time: "09:00", room: "Room 1", kind: "Consultation", state: "completed" },
  { id: "Appointment #1043", time: "09:30", room: "Room 2", kind: "Follow-up", state: "inProgress" },
  { id: "Walk-in #18", time: "10:00", room: "Room 3", kind: "General visit", state: "waiting" },
  { id: "Appointment #1044", time: "10:30", room: "Room 1", kind: "Check-in", state: "available" },
] as const;

/** Premium teal/türkis Palette (hell, modern, vertrauenswürdig). */
export const PIVOT_COLORS = {
  teal: "#0D9488",
  tealDark: "#0F766E",
  tealDeep: "#134E4A",
  tealSoft: "#5EEAD4",
  tealTint: "#CCFBF1",
  bg: "#F3FBFA",
  surface: "#FFFFFF",
  ink: "#0F2A2A",
  slate: "#475569",
  line: "#E2E8F0",
} as const;

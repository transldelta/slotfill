/**
 * Public product content — ClinicSlotHub: Modern Clinic Scheduling OS.
 *
 * READ-ONLY copy data. Public product languages: EN (main), FR, ES.
 * No German public product copy. No external services, no patient data,
 * no medical advice, no payment, no booking storage. Static demo only.
 *
 * Commercial simplicity: the H1 is a plain promise, the product name is a
 * smaller label, money logic is explained without activating any payment.
 */

export interface PivotDict {
  brand: string;
  tagline: string;
  nav: { home: string; howItWorks: string; demo: string; forClinics: string; pricing: string; safety: string };
  cta: { requestAccess: string; viewDemo: string; pilotAccess: string; contact: string };
  hero: { h1: string; subline: string; supporting: string; trust: string };
  what: { title: string; cards: { title: string; body: string }[] };
  mockup: {
    todayBoard: string; appointments: string; walkInQueue: string; availableSlots: string;
    rooms: string; services: string; quickActions: string; stats: string; mobilePreview: string;
    waiting: string; inProgress: string; completed: string; available: string;
  };
  forClinics: { title: string; intro: string; points: string[] };
  forPatients: { title: string; intro: string; points: string[] };
  patientsLine: string;
  howItWorks: { title: string; steps: string[] };
  demo: { title: string; intro: string; notes: string[]; whyTitle: string; why: string[] };
  pricing: { title: string; intro: string; plans: { name: string; for: string; price: string }[]; cta: string; note: string };
  safety: { title: string; body: string };
  footerNote: string;
  rights: string;
}

const EN: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Home", howItWorks: "How it works", demo: "Demo", forClinics: "For clinics", pricing: "Pricing", safety: "Safety" },
  cta: { requestAccess: "Request pilot access", viewDemo: "View demo", pilotAccess: "Request pilot access", contact: "Email the team" },
  hero: {
    h1: "Run the clinic day in one simple board.",
    subline: "ClinicSlotHub helps clinics manage appointments, walk-ins, rooms and open slots without heavy hospital software.",
    supporting: "Built for front desks that need clarity, speed and a calmer daily workflow.",
    trust: "Made for clinic teams that need clarity, not complexity.",
  },
  what: {
    title: "What ClinicSlotHub does",
    cards: [
      { title: "Appointments", body: "Plan scheduled visits in a simple daily view." },
      { title: "Walk-ins", body: "Add walk-in patients to a clear queue — no names or medical details in the public demo." },
      { title: "Available slots", body: "See open times, rooms and service capacity at a glance." },
    ],
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
  patientsLine: "For patients: clearer check-in, simple queue status and less confusion.",
  howItWorks: {
    title: "How it works",
    steps: ["Set the day's schedule", "Add appointments and walk-ins", "Manage rooms, services and availability", "Keep the clinic day organized"],
  },
  demo: {
    title: "View the demo",
    intro: "This demo shows how a clinic can organize today's appointments, walk-ins, rooms and available slots in one simple board.",
    notes: ["Static demo — anonymized sample data", "No real patient data", "No medical records", "No payment processing", "No uploads"],
    whyTitle: "Why it matters",
    why: ["Less front-desk confusion", "Clearer daily planning", "Faster overview of open slots", "Simple workflow for small teams"],
  },
  pricing: {
    title: "Simple monthly plans for clinics",
    intro: "ClinicSlotHub is designed as a monthly SaaS tool for clinics and small medical teams.",
    plans: [
      { name: "Starter", for: "For small clinics that need one simple daily board.", price: "from $29/month" },
      { name: "Clinic Pro", for: "For clinics that manage appointments and walk-ins every day.", price: "from $79/month" },
      { name: "Clinic Plus", for: "For larger teams, multiple rooms or higher daily volume.", price: "Pilot pricing on request" },
    ],
    cta: "Request pilot access",
    note: "Final pricing is confirmed before activation. No payment is processed on this website.",
  },
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
  nav: { home: "Accueil", howItWorks: "Comment ça marche", demo: "Démo", forClinics: "Pour les cliniques", pricing: "Tarifs", safety: "Sécurité" },
  cta: { requestAccess: "Demander l'accès pilote", viewDemo: "Voir la démo", pilotAccess: "Demander l'accès pilote", contact: "Écrire à l'équipe" },
  hero: {
    h1: "Organisez la journée de la clinique dans un tableau simple.",
    subline: "ClinicSlotHub aide les cliniques à gérer les rendez-vous, les arrivées sans réservation, les salles et les créneaux disponibles sans logiciel hospitalier lourd.",
    supporting: "Conçu pour les accueils qui ont besoin de clarté, de rapidité et d'un quotidien plus serein.",
    trust: "Pensé pour les équipes de clinique qui veulent de la clarté, pas de la complexité.",
  },
  what: {
    title: "Ce que fait ClinicSlotHub",
    cards: [
      { title: "Rendez-vous", body: "Planifiez les visites programmées dans une vue quotidienne simple." },
      { title: "Arrivées sans réservation", body: "Ajoutez les patients sans réservation à une file claire — sans nom ni détail médical dans la démo publique." },
      { title: "Créneaux disponibles", body: "Visualisez les horaires libres, les salles et la capacité de service d'un coup d'œil." },
    ],
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
  patientsLine: "Pour les patients : un accueil plus clair, un statut de file simple et moins de confusion.",
  howItWorks: {
    title: "Comment ça marche",
    steps: ["Préparez le planning du jour", "Ajoutez les rendez-vous et les arrivées sans réservation", "Gérez les salles, les services et les disponibilités", "Gardez la journée organisée"],
  },
  demo: {
    title: "Voir la démo",
    intro: "Cette démo montre comment une clinique peut organiser les rendez-vous, les arrivées, les salles et les créneaux disponibles du jour dans un tableau simple.",
    notes: ["Démo statique — données d'exemple anonymisées", "Aucune donnée patient réelle", "Aucun dossier médical", "Aucun paiement", "Aucun téléversement"],
    whyTitle: "Pourquoi c'est utile",
    why: ["Moins de confusion à l'accueil", "Une planification quotidienne plus claire", "Un aperçu plus rapide des créneaux libres", "Un flux simple pour les petites équipes"],
  },
  pricing: {
    title: "Forfaits mensuels simples pour les cliniques",
    intro: "ClinicSlotHub est conçu comme un outil SaaS mensuel pour les cliniques et les petites équipes médicales.",
    plans: [
      { name: "Starter", for: "Pour les petites cliniques qui ont besoin d'un seul tableau quotidien simple.", price: "à partir de 29 $/mois" },
      { name: "Clinic Pro", for: "Pour les cliniques qui gèrent chaque jour les rendez-vous et les arrivées.", price: "à partir de 79 $/mois" },
      { name: "Clinic Plus", for: "Pour les grandes équipes, plusieurs salles ou un volume quotidien plus élevé.", price: "Tarif pilote sur demande" },
    ],
    cta: "Demander l'accès pilote",
    note: "Le tarif final est confirmé avant l'activation. Aucun paiement n'est traité sur ce site web.",
  },
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
  nav: { home: "Inicio", howItWorks: "Cómo funciona", demo: "Demo", forClinics: "Para clínicas", pricing: "Precios", safety: "Seguridad" },
  cta: { requestAccess: "Solicitar acceso piloto", viewDemo: "Ver demo", pilotAccess: "Solicitar acceso piloto", contact: "Escribir al equipo" },
  hero: {
    h1: "Organice el día de la clínica en un panel simple.",
    subline: "ClinicSlotHub ayuda a las clínicas a gestionar citas, llegadas sin reserva, salas y horarios disponibles sin software hospitalario complejo.",
    supporting: "Diseñado para recepciones que necesitan claridad, rapidez y un día a día más tranquilo.",
    trust: "Hecho para equipos de clínica que quieren claridad, no complejidad.",
  },
  what: {
    title: "Qué hace ClinicSlotHub",
    cards: [
      { title: "Citas", body: "Planifique las visitas programadas en una vista diaria simple." },
      { title: "Llegadas sin reserva", body: "Añada pacientes sin reserva a una fila clara — sin nombres ni detalles médicos en la demo pública." },
      { title: "Horarios disponibles", body: "Vea los horarios libres, las salas y la capacidad de servicio de un vistazo." },
    ],
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
  patientsLine: "Para pacientes: un registro más claro, un estado de fila simple y menos confusión.",
  howItWorks: {
    title: "Cómo funciona",
    steps: ["Prepare el horario del día", "Añada citas y llegadas sin reserva", "Gestione salas, servicios y disponibilidad", "Mantenga el día organizado"],
  },
  demo: {
    title: "Ver la demo",
    intro: "Esta demo muestra cómo una clínica puede organizar las citas, las llegadas, las salas y los horarios disponibles del día en un panel simple.",
    notes: ["Demo estática — datos de ejemplo anonimizados", "Sin datos reales de pacientes", "Sin historiales médicos", "Sin procesamiento de pagos", "Sin cargas de archivos"],
    whyTitle: "Por qué importa",
    why: ["Menos confusión en recepción", "Una planificación diaria más clara", "Una visión más rápida de los horarios libres", "Un flujo simple para equipos pequeños"],
  },
  pricing: {
    title: "Planes mensuales simples para clínicas",
    intro: "ClinicSlotHub está diseñado como una herramienta SaaS mensual para clínicas y equipos médicos pequeños.",
    plans: [
      { name: "Starter", for: "Para clínicas pequeñas que necesitan un panel diario simple.", price: "desde $29/mes" },
      { name: "Clinic Pro", for: "Para clínicas que gestionan citas y llegadas sin reserva cada día.", price: "desde $79/mes" },
      { name: "Clinic Plus", for: "Para equipos más grandes, varias salas o mayor volumen diario.", price: "Precio piloto a pedido" },
    ],
    cta: "Solicitar acceso piloto",
    note: "El precio final se confirma antes de la activación. No se procesa ningún pago en este sitio web.",
  },
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

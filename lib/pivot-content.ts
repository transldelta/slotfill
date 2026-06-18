/**
 * Public product content — ClinicSlotHub: a simple daily board for clinic
 * reception and practice organization.
 *
 * READ-ONLY copy data. Public product languages: EN (main), FR, ES.
 * No German public product copy. No external services, no patient data,
 * no medical advice, no payment, no booking storage. Interactive demo runs
 * purely in React state (no storage, no API) and uses anonymized sample tokens.
 */

export interface PivotDict {
  brand: string;
  tagline: string;
  nav: { home: string; howItWorks: string; demo: string; forClinics: string; pricing: string; safety: string };
  cta: { requestAccess: string; viewDemo: string; pilotAccess: string; contact: string };
  hero: { h1: string; subline: string; supporting: string; trust: string };
  problem: { title: string; pains: string[]; solutionTitle: string; solution: string };
  mockup: {
    todayBoard: string; appointments: string; walkInQueue: string; availableSlots: string;
    rooms: string; services: string; quickActions: string; stats: string; mobilePreview: string;
    waiting: string; inProgress: string; completed: string; available: string;
  };
  forClinics: { title: string; intro: string; points: string[] };
  forPatients: { title: string; intro: string; points: string[] };
  patientsLine: string;
  howItWorks: { title: string; steps: string[] };
  demo: {
    title: string; intro: string; notes: string[]; whyTitle: string; why: string[]; safeNote: string;
    tabs: { todayBoard: string; walkInQueue: string; openSlots: string; rooms: string };
    actions: { addWalkIn: string; markCompleted: string; showOpenSlots: string; reset: string };
  };
  money: { title: string; intro: string; plans: { name: string; price: string; for: string }[]; note: string; cta: string };
  access: { pilotRequest: string; emailIntro: string; copyEmail: string; copied: string };
  safety: { title: string; body: string };
  footerNote: string;
  rights: string;
}

const EN: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Home", howItWorks: "How it works", demo: "Demo", forClinics: "For clinics", pricing: "Pricing", safety: "Safety" },
  cta: { requestAccess: "Request pilot access", viewDemo: "Open interactive demo", pilotAccess: "Request pilot access", contact: "Email the team" },
  hero: {
    h1: "One board for today's clinic work.",
    subline: "Manage appointments, walk-ins, rooms and open slots in a simple front-desk board.",
    supporting: "Built for clinics that need less chaos at reception and a faster view of the day.",
    trust: "Made for clinic teams that need clarity, not complexity.",
  },
  problem: {
    title: "Busy clinic days create front-desk confusion.",
    pains: ["Appointments change", "Walk-ins arrive", "Rooms become busy", "Open slots get missed"],
    solutionTitle: "The fix",
    solution: "ClinicSlotHub gives the team one simple board for today's work.",
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
  patientsLine: "For patients, the experience stays simple: clearer check-in, queue status and less confusion.",
  howItWorks: {
    title: "How it works",
    steps: ["Set the day's schedule", "Add appointments and walk-ins", "Manage rooms, services and availability", "Keep the clinic day organized"],
  },
  demo: {
    title: "Interactive demo",
    intro: "Try a clinic's daily board: switch tabs, add a sample walk-in, mark one as completed and reset.",
    notes: ["Safe sample demo — anonymized data only", "No real patient data", "No medical records", "No payment processing", "No uploads"],
    whyTitle: "Why it matters",
    why: ["Less front-desk confusion", "Clearer daily planning", "Faster overview of open slots", "Simple workflow for small teams"],
    safeNote: "This is a safe sample demo. It does not store real patient data.",
    tabs: { todayBoard: "Today Board", walkInQueue: "Walk-in Queue", openSlots: "Open Slots", rooms: "Rooms" },
    actions: { addWalkIn: "Add sample walk-in", markCompleted: "Mark sample as completed", showOpenSlots: "Show open slots", reset: "Reset demo" },
  },
  money: {
    title: "How ClinicSlotHub makes money",
    intro: "Clinics pay a monthly subscription for a simple scheduling board. Patients do not pay on this website.",
    plans: [
      { name: "Starter", price: "from $29/month", for: "For one small clinic that needs a simple daily board." },
      { name: "Clinic Pro", price: "from $79/month", for: "For teams that manage appointments and walk-ins every day." },
      { name: "Clinic Plus", price: "custom pilot pricing", for: "For larger teams, multiple rooms or higher daily volume." },
    ],
    note: "No payment is processed on this website. Pricing is confirmed before activation.",
    cta: "Request pilot access",
  },
  access: { pilotRequest: "Pilot request:", emailIntro: "Email us at", copyEmail: "Copy email", copied: "Copied" },
  safety: {
    title: "Safety",
    body: "ClinicSlotHub is not a medical advice tool. It does not provide diagnosis, treatment recommendations or emergency services. The demo does not store medical records, accept uploads or process patient payments.",
  },
  footerNote: "ClinicSlotHub is a lightweight clinic scheduling board. No medical advice, no diagnosis, no patient records, no payment.",
  rights: "All rights reserved.",
};

const FR: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Accueil", howItWorks: "Comment ça marche", demo: "Démo", forClinics: "Pour les cliniques", pricing: "Tarifs", safety: "Sécurité" },
  cta: { requestAccess: "Demander l'accès pilote", viewDemo: "Ouvrir la démo interactive", pilotAccess: "Demander l'accès pilote", contact: "Écrire à l'équipe" },
  hero: {
    h1: "Un seul tableau pour organiser la journée de la clinique.",
    subline: "Gérez les rendez-vous, les arrivées sans réservation, les salles et les créneaux disponibles dans un tableau simple pour l'accueil.",
    supporting: "Conçu pour les cliniques qui veulent moins de chaos à l'accueil et une vue plus rapide de la journée.",
    trust: "Pensé pour les équipes de clinique qui veulent de la clarté, pas de la complexité.",
  },
  problem: {
    title: "Les journées chargées créent de la confusion à l'accueil.",
    pains: ["Les rendez-vous changent", "Des patients arrivent sans réservation", "Les salles se remplissent", "Des créneaux libres passent inaperçus"],
    solutionTitle: "La solution",
    solution: "ClinicSlotHub donne à l'équipe un seul tableau simple pour le travail du jour.",
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
  patientsLine: "Pour les patients, l'expérience reste simple : un accueil plus clair, le statut de la file et moins de confusion.",
  howItWorks: {
    title: "Comment ça marche",
    steps: ["Préparez le planning du jour", "Ajoutez les rendez-vous et les arrivées sans réservation", "Gérez les salles, les services et les disponibilités", "Gardez la journée organisée"],
  },
  demo: {
    title: "Démo interactive",
    intro: "Essayez le tableau quotidien d'une clinique : changez d'onglet, ajoutez une arrivée d'exemple, marquez-en une comme terminée et réinitialisez.",
    notes: ["Démo d'exemple sûre — données anonymisées uniquement", "Aucune donnée patient réelle", "Aucun dossier médical", "Aucun paiement", "Aucun téléversement"],
    whyTitle: "Pourquoi c'est utile",
    why: ["Moins de confusion à l'accueil", "Une planification quotidienne plus claire", "Un aperçu plus rapide des créneaux libres", "Un flux simple pour les petites équipes"],
    safeNote: "Ceci est une démo d'exemple sûre. Elle ne stocke aucune donnée patient réelle.",
    tabs: { todayBoard: "Tableau du jour", walkInQueue: "File d'attente", openSlots: "Créneaux libres", rooms: "Salles" },
    actions: { addWalkIn: "Ajouter une arrivée d'exemple", markCompleted: "Marquer l'exemple comme terminé", showOpenSlots: "Afficher les créneaux libres", reset: "Réinitialiser la démo" },
  },
  money: {
    title: "Comment ClinicSlotHub gagne de l'argent",
    intro: "Les cliniques paient un abonnement mensuel pour un tableau de planification simple. Les patients ne paient pas sur ce site.",
    plans: [
      { name: "Starter", price: "à partir de 29 $/mois", for: "Pour une petite clinique qui a besoin d'un tableau quotidien simple." },
      { name: "Clinic Pro", price: "à partir de 79 $/mois", for: "Pour les équipes qui gèrent chaque jour les rendez-vous et les arrivées." },
      { name: "Clinic Plus", price: "tarif pilote personnalisé", for: "Pour les grandes équipes, plusieurs salles ou un volume quotidien plus élevé." },
    ],
    note: "Aucun paiement n'est traité sur ce site web. Le tarif est confirmé avant l'activation.",
    cta: "Demander l'accès pilote",
  },
  access: { pilotRequest: "Demande pilote :", emailIntro: "Écrivez-nous à", copyEmail: "Copier l'e-mail", copied: "Copié" },
  safety: {
    title: "Sécurité",
    body: "ClinicSlotHub n'est pas un outil de conseil médical. Il ne fournit pas de diagnostic, de recommandation de traitement ni de service d'urgence. La démo ne stocke pas de dossier médical, n'accepte pas de téléversement et ne traite pas les paiements des patients.",
  },
  footerNote: "ClinicSlotHub est un tableau de planification léger pour cliniques. Pas de conseil médical, pas de diagnostic, pas de dossier patient, pas de paiement.",
  rights: "Tous droits réservés.",
};

const ES: PivotDict = {
  brand: "ClinicSlotHub",
  tagline: "Modern Clinic Scheduling OS",
  nav: { home: "Inicio", howItWorks: "Cómo funciona", demo: "Demo", forClinics: "Para clínicas", pricing: "Precios", safety: "Seguridad" },
  cta: { requestAccess: "Solicitar acceso piloto", viewDemo: "Abrir demo interactiva", pilotAccess: "Solicitar acceso piloto", contact: "Escribir al equipo" },
  hero: {
    h1: "Un solo panel para organizar el día de la clínica.",
    subline: "Gestione citas, llegadas sin reserva, salas y horarios disponibles en un panel simple para recepción.",
    supporting: "Diseñado para clínicas que quieren menos caos en recepción y una vista más rápida del día.",
    trust: "Hecho para equipos de clínica que quieren claridad, no complejidad.",
  },
  problem: {
    title: "Los días con mucho movimiento generan confusión en recepción.",
    pains: ["Las citas cambian", "Llegan pacientes sin reserva", "Las salas se ocupan", "Se pierden horarios libres"],
    solutionTitle: "La solución",
    solution: "ClinicSlotHub le da al equipo un solo panel simple para el trabajo del día.",
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
  patientsLine: "Para los pacientes, la experiencia sigue siendo simple: un registro más claro, el estado de la fila y menos confusión.",
  howItWorks: {
    title: "Cómo funciona",
    steps: ["Prepare el horario del día", "Añada citas y llegadas sin reserva", "Gestione salas, servicios y disponibilidad", "Mantenga el día organizado"],
  },
  demo: {
    title: "Demo interactiva",
    intro: "Pruebe el panel diario de una clínica: cambie de pestaña, añada una llegada de ejemplo, marque una como completada y reinicie.",
    notes: ["Demo de ejemplo segura — solo datos anonimizados", "Sin datos reales de pacientes", "Sin historiales médicos", "Sin procesamiento de pagos", "Sin cargas de archivos"],
    whyTitle: "Por qué importa",
    why: ["Menos confusión en recepción", "Una planificación diaria más clara", "Una visión más rápida de los horarios libres", "Un flujo simple para equipos pequeños"],
    safeNote: "Esta es una demo de ejemplo segura. No almacena datos reales de pacientes.",
    tabs: { todayBoard: "Panel del día", walkInQueue: "Fila sin reserva", openSlots: "Horarios libres", rooms: "Salas" },
    actions: { addWalkIn: "Añadir llegada de ejemplo", markCompleted: "Marcar ejemplo como completado", showOpenSlots: "Mostrar horarios libres", reset: "Reiniciar demo" },
  },
  money: {
    title: "Cómo gana dinero ClinicSlotHub",
    intro: "Las clínicas pagan una suscripción mensual por un panel de planificación simple. Los pacientes no pagan en este sitio web.",
    plans: [
      { name: "Starter", price: "desde $29/mes", for: "Para una clínica pequeña que necesita un panel diario simple." },
      { name: "Clinic Pro", price: "desde $79/mes", for: "Para equipos que gestionan citas y llegadas cada día." },
      { name: "Clinic Plus", price: "precio piloto personalizado", for: "Para equipos más grandes, varias salas o mayor volumen diario." },
    ],
    note: "No se procesa ningún pago en este sitio web. El precio se confirma antes de la activación.",
    cta: "Solicitar acceso piloto",
  },
  access: { pilotRequest: "Solicitud piloto:", emailIntro: "Escríbanos a", copyEmail: "Copiar correo", copied: "Copiado" },
  safety: {
    title: "Seguridad",
    body: "ClinicSlotHub no es una herramienta de asesoramiento médico. No proporciona diagnósticos, recomendaciones de tratamiento ni servicios de emergencia. La demo no almacena historiales médicos, no acepta cargas de archivos y no procesa pagos de pacientes.",
  },
  footerNote: "ClinicSlotHub es un panel de planificación ligero para clínicas. Sin asesoramiento médico, sin diagnóstico, sin historiales de pacientes, sin pagos.",
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

/** Anonymisierte Mockup-/Demo-Beispieldaten — keine Namen, keine PII. */
export const MOCK_ROWS = [
  { id: "Appointment #1042", time: "09:00", room: "Room 1", kind: "Consultation", state: "completed" },
  { id: "Appointment #1043", time: "09:30", room: "Room 2", kind: "Follow-up", state: "inProgress" },
  { id: "Walk-in #18", time: "10:00", room: "Room 3", kind: "General visit", state: "waiting" },
  { id: "Appointment #1044", time: "10:30", room: "Room 1", kind: "Check-in", state: "available" },
] as const;

/** Anonyme Beispiel-Walk-ins für die interaktive Demo (nur lokaler React-State). */
export const DEMO_WALKINS = [
  { id: "Walk-in #19", time: "10:15", room: "Room 2", kind: "General visit", state: "waiting" },
  { id: "Walk-in #20", time: "10:45", room: "Room 3", kind: "General visit", state: "waiting" },
  { id: "Walk-in #21", time: "11:00", room: "Room 1", kind: "General visit", state: "waiting" },
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

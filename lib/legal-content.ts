/**
 * lib/legal-content.ts – Zentrale Locale-Dictionaries für Legal-Seiten
 *
 * REGEL:
 * - Deutsche Version ist die rechtlich maßgebliche Originalfassung.
 * - Alle anderen Sprachen sind unverbindliche Verständnishilfen (convenience translations).
 * - Keine Rechtsberatung behaupten.
 * - ENTWURF-Hinweise bleiben bestehen, solange LEGAL_REVIEW_APPROVED nicht true ist.
 * - Persönliche Anbieterangaben nur in Impressum, Datenschutz, AGB und AVV.
 * - Keine persönlichen Namen in automatischer Kommunikation.
 */

export type LegalLocale =
  | "de" | "en" | "zh" | "hi" | "es" | "ar" | "fr" | "pt" | "bn" | "ru";

/** Gibt true zurück, wenn die Locale von rechts nach links gelesen wird. */
export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

export interface LegalLocaleData {
  /** Schreibrichtung der Locale */
  dir: "ltr" | "rtl";
  /** "Zurück"-Link-Label (Breadcrumb) */
  backLabel: string;
  /** Stand-Datum der Seite */
  standDate: string;

  // ─── Seitentitel ──────────────────────────────────────────────────────────
  agbTitle: string;
  datenschutzTitle: string;
  impressumTitle: string;
  avvTitle: string;

  // ─── Allgemeine Hinweise ──────────────────────────────────────────────────
  /** ENTWURF-Hinweis: "nicht rechtskräftig" */
  draftNotice: string;
  /** Hinweis für Nicht-DE: "Deutsche Version ist maßgeblich" */
  authorityNotice: string;
  /** Link-Label: "Deutsche Originalfassung anzeigen →" */
  authorityLinkLabel: string;
  /** "[zu prüfen]"-Label */
  reviewNote: string;
  /** "Wichtig"-Label */
  importantLabel: string;

  // ─── AGB: Abschnittsüberschriften ────────────────────────────────────────
  agbSection1: string;  // Geltungsbereich / Scope
  agbSection2: string;  // Leistungsbeschreibung / Services
  agbSection3: string;  // Testphase / Trial
  agbSection4: string;  // Messaging-Dienste / Messaging
  agbSection5: string;  // Datenschutz / Data Protection
  agbSection6: string;  // Haftung / Liability
  agbSection7: string;  // Kündigung / Termination
  agbSection8: string;  // Schlussbestimmungen / Final Provisions
  /** Nummern-Präfix für Abschnitte, z.B. "§" (de) oder "Art." (en) oder "المادة" (ar) */
  sectionPrefix: string;

  // ─── AGB: Kernaussagen (für Nicht-DE-Zusammenfassung) ────────────────────
  agbKeyB2bOnly: string;
  agbKeyNoSmsTrial: string;
  agbKeyTrialDays: string;
  agbKeyProviderOptional: string;
  agbKeyNoColdOutreach: string;
  agbKeyDpaRequired: string;
  agbKeyGermanLaw: string;

  // ─── Datenschutz: Abschnittsüberschriften ────────────────────────────────
  dsSection1: string;
  dsSection2: string;
  dsSection3: string;
  dsSection4: string;
  dsSection5: string;
  dsSection6: string;
  dsSection7: string;
  /** Kernaussagen für Datenschutz-Zusammenfassung */
  dsKeyPurposeLimitation: string;
  dsKeyNoTracking: string;
  dsKeyAVVRequired: string;

  // ─── Impressum ────────────────────────────────────────────────────────────
  impressumSection1: string;  // "Angaben gemäß § 5 DDG" / "Legal notice"
  impressumContactSection: string;
  impressumResponsibleSection: string;
  impressumLiabilitySection: string;
  impressumLiabilityContent: string;
  impressumLiabilityLinks: string;
  impressumLiabilityLinksText: string;

  // ─── AVV ─────────────────────────────────────────────────────────────────
  avvSubtitle: string;
  avvWhySection: string;
  avvWhenSection: string;
  avvWhatSection: string;
  avvRequestSection: string;
  avvSubprocessorsSection: string;
  avvDraftNotice: string;
}

// ─── Locale-Dictionaries ──────────────────────────────────────────────────────

const de: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "Stand: Mai 2026",
  agbTitle: "Allgemeine Geschäftsbedingungen (AGB)",
  datenschutzTitle: "Datenschutzerklärung",
  impressumTitle: "Impressum",
  avvTitle: "Auftragsverarbeitungsvertrag (AVV)",
  draftNotice:
    "ENTWURF – nicht rechtskräftig. Dieser Text ist ein vorläufiger Entwurf und wurde noch nicht abschließend rechtlich geprüft. Er ersetzt keine Rechtsberatung und darf nicht als finale AGB verwendet werden. Vor dem Produktivstart muss eine rechtsanwaltliche Prüfung erfolgen.",
  authorityNotice: "",
  authorityLinkLabel: "",
  reviewNote: "[zu prüfen]",
  importantLabel: "Wichtig",
  sectionPrefix: "§",
  agbSection1: "Geltungsbereich",
  agbSection2: "Leistungsbeschreibung",
  agbSection3: "Testphase (Trial)",
  agbSection4: "Messaging-Dienste und externe Provider",
  agbSection5: "Datenschutz und Auftragsverarbeitung (AVV)",
  agbSection6: "Haftung",
  agbSection7: "Vertragslaufzeit und Kündigung",
  agbSection8: "Schlussbestimmungen",
  agbKeyB2bOnly: "Nur für Gewerbetreibende (Arzt-/Therapiepraxen).",
  agbKeyNoSmsTrial: "Im Testmodus werden keine echten SMS/WhatsApp versendet.",
  agbKeyTrialDays: "14 Tage kostenlose Testphase, keine Kreditkarte erforderlich.",
  agbKeyProviderOptional: "Messaging-Provider (z. B. Twilio) ist optional und wird separat konfiguriert.",
  agbKeyNoColdOutreach: "Kaltakquise ist verboten.",
  agbKeyDpaRequired: "AVV gemäß Art. 28 DSGVO vor Eingabe von Patientendaten erforderlich.",
  agbKeyGermanLaw: "Es gilt deutsches Recht; Gerichtsstand: Karlsruhe.",
  dsSection1: "Verantwortlicher",
  dsSection2: "Datenschutzbewusster Ansatz",
  dsSection3: "Welche Daten werden verarbeitet?",
  dsSection4: "Drittanbieter und Auftragsverarbeiter",
  dsSection5: "Ihre Rechte als betroffene Person",
  dsSection6: "Auftragsverarbeitungsvertrag (AVV)",
  dsSection7: "Cookies und Tracking",
  dsKeyPurposeLimitation: "Keine automatische Kaltakquise oder Massenversand ohne Einwilligung.",
  dsKeyNoTracking: "Keine Tracking-Cookies ohne Einwilligung.",
  dsKeyAVVRequired: "AVV erforderlich vor Eingabe von Patientendaten.",
  impressumSection1: "Angaben gemäß § 5 DDG",
  impressumContactSection: "Kontakt",
  impressumResponsibleSection: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
  impressumLiabilitySection: "Haftungsausschluss",
  impressumLiabilityContent: "Haftung für Inhalte",
  impressumLiabilityLinks: "Haftung für Links",
  impressumLiabilityLinksText:
    "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.",
  avvSubtitle: "Gemäß Art. 28 DSGVO",
  avvWhySection: "Warum ist ein AVV notwendig?",
  avvWhenSection: "Wann benötige ich einen AVV?",
  avvWhatSection: "Was regelt der AVV?",
  avvRequestSection: "AVV anfordern",
  avvSubprocessorsSection: "Unterauftragsverarbeiter (Sub-Prozessoren)",
  avvDraftNotice:
    "ENTWURF – AVV-Dokument noch nicht finalisiert. Diese Seite informiert über die gesetzliche Pflicht zum AVV-Abschluss. Das vollständige AVV-Dokument wird vor dem Produktivstart bereitgestellt.",
};

const en: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "As of: May 2026",
  agbTitle: "Terms and Conditions",
  datenschutzTitle: "Privacy Policy",
  impressumTitle: "Legal Notice (Impressum)",
  avvTitle: "Data Processing Agreement (DPA)",
  draftNotice:
    "DRAFT – not legally binding. This text is a preliminary draft and has not yet been fully reviewed by a lawyer. It does not constitute legal advice.",
  authorityNotice:
    "This is a non-binding convenience translation. The German version is the legally authoritative version.",
  authorityLinkLabel: "View German original →",
  reviewNote: "[to review]",
  importantLabel: "Important",
  sectionPrefix: "Art.",
  agbSection1: "Scope",
  agbSection2: "Service Description",
  agbSection3: "Trial Period",
  agbSection4: "Messaging Services & External Providers",
  agbSection5: "Data Protection & Data Processing Agreement (DPA)",
  agbSection6: "Liability",
  agbSection7: "Contract Term & Termination",
  agbSection8: "Final Provisions",
  agbKeyB2bOnly: "SlotFill is exclusively for commercial users (medical and therapy practices). Consumer use is excluded.",
  agbKeyNoSmsTrial: "In trial mode, no real SMS or WhatsApp messages are sent. All messages are simulated (dry-run) until a provider is actively configured.",
  agbKeyTrialDays: "Free 14-day trial period. No credit card required.",
  agbKeyProviderOptional: "Messaging providers (e.g. Twilio for SMS/WhatsApp) are optional and must be configured separately by the practice. Provider costs are borne by the practice.",
  agbKeyNoColdOutreach: "The platform may only be used to communicate with patients already known to the practice. Unsolicited mass messaging (cold outreach) is strictly prohibited.",
  agbKeyDpaRequired: "A Data Processing Agreement (DPA) pursuant to Art. 28 GDPR is required before entering any patient data.",
  agbKeyGermanLaw: "German law applies. Jurisdiction: Karlsruhe, Germany.",
  dsSection1: "Controller",
  dsSection2: "Privacy-Conscious Approach",
  dsSection3: "What Data Is Processed?",
  dsSection4: "Third-Party Processors",
  dsSection5: "Your Rights as a Data Subject",
  dsSection6: "Data Processing Agreement (DPA)",
  dsSection7: "Cookies & Tracking",
  dsKeyPurposeLimitation: "No automated cold outreach or mass messaging without consent.",
  dsKeyNoTracking: "No tracking cookies without consent.",
  dsKeyAVVRequired: "A DPA is required before entering patient data.",
  impressumSection1: "Legal Notice pursuant to § 5 DDG (German Digital Services Act)",
  impressumContactSection: "Contact",
  impressumResponsibleSection: "Responsible for Content pursuant to § 18 para. 2 MStV",
  impressumLiabilitySection: "Disclaimer",
  impressumLiabilityContent: "Liability for Content",
  impressumLiabilityLinks: "Liability for Links",
  impressumLiabilityLinksText:
    "Our website contains links to external third-party websites, the content of which we have no influence over.",
  avvSubtitle: "Pursuant to Art. 28 GDPR",
  avvWhySection: "Why is a DPA required?",
  avvWhenSection: "When do I need a DPA?",
  avvWhatSection: "What does the DPA regulate?",
  avvRequestSection: "Request a DPA",
  avvSubprocessorsSection: "Sub-processors",
  avvDraftNotice:
    "DRAFT – DPA document not yet finalized. This page provides information about the legal obligation to conclude a DPA. The full DPA document will be provided before go-live.",
};

const fr: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "Date : mai 2026",
  agbTitle: "Conditions générales d'utilisation",
  datenschutzTitle: "Politique de confidentialité",
  impressumTitle: "Mentions légales",
  avvTitle: "Accord de traitement des données (ATD)",
  draftNotice:
    "BROUILLON – non contraignant juridiquement. Ce texte est un avant-projet et n'a pas encore été entièrement examiné par un avocat. Il ne constitue pas un conseil juridique.",
  authorityNotice:
    "Ceci est une traduction non contraignante à titre d'information. La version allemande fait foi sur le plan juridique.",
  authorityLinkLabel: "Voir la version allemande originale →",
  reviewNote: "[à vérifier]",
  importantLabel: "Important",
  sectionPrefix: "Art.",
  agbSection1: "Champ d'application",
  agbSection2: "Description des services",
  agbSection3: "Période d'essai",
  agbSection4: "Services de messagerie et fournisseurs externes",
  agbSection5: "Protection des données et accord de traitement",
  agbSection6: "Responsabilité",
  agbSection7: "Durée du contrat et résiliation",
  agbSection8: "Dispositions finales",
  agbKeyB2bOnly: "SlotFill est exclusivement destiné aux utilisateurs professionnels (cabinets médicaux et thérapeutiques). L'utilisation par des consommateurs est exclue.",
  agbKeyNoSmsTrial: "En mode essai, aucun vrai SMS ou message WhatsApp n'est envoyé. Tous les messages sont simulés jusqu'à la configuration active d'un fournisseur.",
  agbKeyTrialDays: "Période d'essai gratuite de 14 jours. Aucune carte de crédit requise.",
  agbKeyProviderOptional: "Les fournisseurs de messagerie (p. ex. Twilio) sont optionnels et doivent être configurés séparément par le cabinet. Les frais du fournisseur sont à la charge du cabinet.",
  agbKeyNoColdOutreach: "La plateforme ne peut être utilisée que pour communiquer avec des patients déjà connus du cabinet. Le démarchage non sollicité (cold outreach) est strictement interdit.",
  agbKeyDpaRequired: "Un accord de traitement des données (ATD) conformément à l'art. 28 RGPD est requis avant la saisie de données patients.",
  agbKeyGermanLaw: "Le droit allemand est applicable. Juridiction : Karlsruhe, Allemagne.",
  dsSection1: "Responsable du traitement",
  dsSection2: "Approche respectueuse de la vie privée",
  dsSection3: "Quelles données sont traitées ?",
  dsSection4: "Sous-traitants tiers",
  dsSection5: "Vos droits en tant que personne concernée",
  dsSection6: "Accord de traitement des données",
  dsSection7: "Cookies et suivi",
  dsKeyPurposeLimitation: "Pas de démarchage automatisé ni d'envoi massif sans consentement.",
  dsKeyNoTracking: "Pas de cookies de suivi sans consentement.",
  dsKeyAVVRequired: "Un ATD est requis avant la saisie de données patients.",
  impressumSection1: "Mentions légales conformément au § 5 DDG (loi allemande sur les services numériques)",
  impressumContactSection: "Contact",
  impressumResponsibleSection: "Responsable du contenu conformément au § 18 al. 2 MStV",
  impressumLiabilitySection: "Clause de non-responsabilité",
  impressumLiabilityContent: "Responsabilité pour le contenu",
  impressumLiabilityLinks: "Responsabilité pour les liens",
  impressumLiabilityLinksText:
    "Notre offre contient des liens vers des sites web de tiers sur lesquels nous n'avons aucune influence.",
  avvSubtitle: "Conformément à l'art. 28 RGPD",
  avvWhySection: "Pourquoi un ATD est-il nécessaire ?",
  avvWhenSection: "Quand ai-je besoin d'un ATD ?",
  avvWhatSection: "Que règle l'ATD ?",
  avvRequestSection: "Demander un ATD",
  avvSubprocessorsSection: "Sous-traitants (sous-processeurs)",
  avvDraftNotice:
    "BROUILLON – document ATD non encore finalisé. Cette page informe sur l'obligation légale de conclure un ATD. Le document ATD complet sera fourni avant le lancement.",
};

const es: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "Fecha: mayo 2026",
  agbTitle: "Términos y condiciones",
  datenschutzTitle: "Política de privacidad",
  impressumTitle: "Aviso legal",
  avvTitle: "Acuerdo de procesamiento de datos (APD)",
  draftNotice:
    "BORRADOR – sin validez jurídica. Este texto es un borrador preliminar y aún no ha sido revisado por un abogado. No constituye asesoramiento jurídico.",
  authorityNotice:
    "Esta es una traducción informativa no vinculante. La versión en alemán es la versión jurídicamente vinculante.",
  authorityLinkLabel: "Ver versión alemana original →",
  reviewNote: "[por verificar]",
  importantLabel: "Importante",
  sectionPrefix: "Art.",
  agbSection1: "Ámbito de aplicación",
  agbSection2: "Descripción del servicio",
  agbSection3: "Período de prueba",
  agbSection4: "Servicios de mensajería y proveedores externos",
  agbSection5: "Protección de datos y acuerdo de procesamiento",
  agbSection6: "Responsabilidad",
  agbSection7: "Duración del contrato y rescisión",
  agbSection8: "Disposiciones finales",
  agbKeyB2bOnly: "SlotFill está destinado exclusivamente a usuarios comerciales (consultas médicas y terapéuticas). El uso por consumidores está excluido.",
  agbKeyNoSmsTrial: "En modo de prueba, no se envían SMS ni mensajes de WhatsApp reales. Todos los mensajes se simulan hasta que se configure activamente un proveedor.",
  agbKeyTrialDays: "Período de prueba gratuito de 14 días. No se requiere tarjeta de crédito.",
  agbKeyProviderOptional: "Los proveedores de mensajería (p. ej. Twilio) son opcionales y deben configurarse por separado. Los costes del proveedor corren a cargo de la consulta.",
  agbKeyNoColdOutreach: "La plataforma solo puede utilizarse para comunicarse con pacientes ya conocidos por la consulta. El envío masivo no solicitado (cold outreach) está estrictamente prohibido.",
  agbKeyDpaRequired: "Se requiere un Acuerdo de Procesamiento de Datos (APD) conforme al Art. 28 RGPD antes de introducir datos de pacientes.",
  agbKeyGermanLaw: "Se aplica la legislación alemana. Jurisdicción: Karlsruhe, Alemania.",
  dsSection1: "Responsable del tratamiento",
  dsSection2: "Enfoque consciente de la privacidad",
  dsSection3: "¿Qué datos se procesan?",
  dsSection4: "Proveedores de servicios externos",
  dsSection5: "Sus derechos como persona interesada",
  dsSection6: "Acuerdo de procesamiento de datos",
  dsSection7: "Cookies y seguimiento",
  dsKeyPurposeLimitation: "Sin prospección automatizada ni envío masivo sin consentimiento.",
  dsKeyNoTracking: "Sin cookies de seguimiento sin consentimiento.",
  dsKeyAVVRequired: "Se requiere un APD antes de introducir datos de pacientes.",
  impressumSection1: "Aviso legal conforme al § 5 DDG (Ley alemana de servicios digitales)",
  impressumContactSection: "Contacto",
  impressumResponsibleSection: "Responsable del contenido conforme al § 18 párr. 2 MStV",
  impressumLiabilitySection: "Aviso de exención de responsabilidad",
  impressumLiabilityContent: "Responsabilidad por el contenido",
  impressumLiabilityLinks: "Responsabilidad por los enlaces",
  impressumLiabilityLinksText:
    "Nuestra oferta contiene enlaces a sitios web de terceros sobre cuyo contenido no tenemos ninguna influencia.",
  avvSubtitle: "Conforme al Art. 28 RGPD",
  avvWhySection: "¿Por qué es necesario un APD?",
  avvWhenSection: "¿Cuándo necesito un APD?",
  avvWhatSection: "¿Qué regula el APD?",
  avvRequestSection: "Solicitar un APD",
  avvSubprocessorsSection: "Subencargados del tratamiento",
  avvDraftNotice:
    "BORRADOR – documento APD aún no finalizado. Esta página informa sobre la obligación legal de celebrar un APD. El documento APD completo se facilitará antes del lanzamiento.",
};

const ar: LegalLocaleData = {
  dir: "rtl",
  backLabel: "SlotFill",
  standDate: "التاريخ: مايو 2026",
  agbTitle: "الشروط والأحكام",
  datenschutzTitle: "سياسة الخصوصية",
  impressumTitle: "الإشعار القانوني",
  avvTitle: "اتفاقية معالجة البيانات",
  draftNotice:
    "مسودة – غير ملزمة قانونياً. هذا النص مسودة أولية ولم تتم مراجعتها بالكامل من قِبَل محامٍ. لا تُعدّ هذه الوثيقة مشورة قانونية.",
  authorityNotice:
    "هذه ترجمة غير ملزمة لأغراض الفهم فقط. النسخة الألمانية هي النسخة المعتمدة قانونياً.",
  authorityLinkLabel: "عرض النسخة الألمانية الأصلية ←",
  reviewNote: "[يحتاج مراجعة]",
  importantLabel: "هام",
  sectionPrefix: "المادة",
  agbSection1: "نطاق التطبيق",
  agbSection2: "وصف الخدمة",
  agbSection3: "فترة التجربة",
  agbSection4: "خدمات المراسلة ومقدمو الخدمة الخارجيون",
  agbSection5: "حماية البيانات واتفاقية المعالجة",
  agbSection6: "المسؤولية",
  agbSection7: "مدة العقد وإنهاؤه",
  agbSection8: "الأحكام الختامية",
  agbKeyB2bOnly: "SlotFill مخصص حصرياً للمستخدمين التجاريين (عيادات طبية وعلاجية). يُستثنى من ذلك المستهلكون الأفراد.",
  agbKeyNoSmsTrial: "في وضع التجربة، لا تُرسَل رسائل SMS أو WhatsApp حقيقية. جميع الرسائل تُحاكى فقط حتى يتم تفعيل مزود خارجي.",
  agbKeyTrialDays: "فترة تجربة مجانية مدتها 14 يوماً. لا يلزم تقديم بطاقة ائتمان.",
  agbKeyProviderOptional: "مزودو المراسلة (مثل Twilio) اختياريون ويجب تكوينهم بشكل منفصل من قِبَل العيادة. تتحمل العيادة تكاليف المزود.",
  agbKeyNoColdOutreach: "لا يجوز استخدام المنصة إلا للتواصل مع مرضى معروفين للعيادة مسبقاً. يُحظر تماماً الإرسال الجماعي غير المرغوب فيه.",
  agbKeyDpaRequired: "يُشترط إبرام اتفاقية معالجة بيانات (DPA) وفقاً للمادة 28 من اللائحة الأوروبية للبيانات (GDPR) قبل إدخال بيانات المرضى.",
  agbKeyGermanLaw: "يسري القانون الألماني. الاختصاص القضائي: كارلسروه، ألمانيا.",
  dsSection1: "المتحكم في البيانات",
  dsSection2: "نهج واعٍ بالخصوصية",
  dsSection3: "ما البيانات التي تتم معالجتها؟",
  dsSection4: "مزودو الخدمة الخارجيون",
  dsSection5: "حقوقك كشخص معني",
  dsSection6: "اتفاقية معالجة البيانات",
  dsSection7: "ملفات تعريف الارتباط والتتبع",
  dsKeyPurposeLimitation: "لا تسويق آلي أو إرسال جماعي دون موافقة.",
  dsKeyNoTracking: "لا ملفات تتبع دون موافقة.",
  dsKeyAVVRequired: "تُشترط اتفاقية معالجة بيانات قبل إدخال بيانات المرضى.",
  impressumSection1: "إشعار قانوني وفقاً للمادة 5 DDG (القانون الألماني للخدمات الرقمية)",
  impressumContactSection: "التواصل",
  impressumResponsibleSection: "المسؤول عن المحتوى وفقاً للمادة 18 فقرة 2 MStV",
  impressumLiabilitySection: "إخلاء المسؤولية",
  impressumLiabilityContent: "المسؤولية عن المحتوى",
  impressumLiabilityLinks: "المسؤولية عن الروابط",
  impressumLiabilityLinksText:
    "تحتوي خدمتنا على روابط لمواقع ويب تابعة لجهات خارجية لا نملك أي تأثير على محتواها.",
  avvSubtitle: "وفقاً للمادة 28 من اللائحة الأوروبية العامة لحماية البيانات (GDPR)",
  avvWhySection: "لماذا تُعدّ اتفاقية معالجة البيانات ضرورية؟",
  avvWhenSection: "متى أحتاج إلى اتفاقية معالجة البيانات؟",
  avvWhatSection: "ما الذي تُنظّمه الاتفاقية؟",
  avvRequestSection: "طلب الاتفاقية",
  avvSubprocessorsSection: "المعالجون الفرعيون",
  avvDraftNotice:
    "مسودة – وثيقة الاتفاقية لم تُنهَ بعد. تُعلم هذه الصفحة بالالتزام القانوني بإبرام اتفاقية معالجة بيانات. ستُوفَّر الوثيقة الكاملة قبل الإطلاق الرسمي.",
};

const pt: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "Data: maio de 2026",
  agbTitle: "Termos e condições",
  datenschutzTitle: "Política de privacidade",
  impressumTitle: "Aviso legal",
  avvTitle: "Acordo de processamento de dados (APD)",
  draftNotice:
    "RASCUNHO – sem validade jurídica. Este texto é um rascunho preliminar e ainda não foi totalmente revisto por um advogado. Não constitui aconselhamento jurídico.",
  authorityNotice:
    "Esta é uma tradução informativa não vinculativa. A versão em alemão é a versão juridicamente vinculativa.",
  authorityLinkLabel: "Ver versão original em alemão →",
  reviewNote: "[a verificar]",
  importantLabel: "Importante",
  sectionPrefix: "Art.",
  agbSection1: "Âmbito de aplicação",
  agbSection2: "Descrição do serviço",
  agbSection3: "Período de experimentação",
  agbSection4: "Serviços de mensagens e fornecedores externos",
  agbSection5: "Proteção de dados e acordo de processamento",
  agbSection6: "Responsabilidade",
  agbSection7: "Duração do contrato e rescisão",
  agbSection8: "Disposições finais",
  agbKeyB2bOnly: "SlotFill destina-se exclusivamente a utilizadores comerciais (consultórios médicos e de terapia).",
  agbKeyNoSmsTrial: "No modo de experimentação, não são enviados SMS ou mensagens WhatsApp reais.",
  agbKeyTrialDays: "Período de experimentação gratuito de 14 dias. Não é necessário cartão de crédito.",
  agbKeyProviderOptional: "Os fornecedores de mensagens (p. ex. Twilio) são opcionais e configurados separadamente pelo consultório.",
  agbKeyNoColdOutreach: "A plataforma só pode ser utilizada para comunicar com pacientes já conhecidos pelo consultório. O envio em massa não solicitado é estritamente proibido.",
  agbKeyDpaRequired: "É necessário um Acordo de Processamento de Dados (APD) nos termos do Art. 28 RGPD antes de introduzir dados de pacientes.",
  agbKeyGermanLaw: "Aplica-se a legislação alemã. Jurisdição: Karlsruhe, Alemanha.",
  dsSection1: "Responsável pelo tratamento", dsSection2: "Abordagem consciente de privacidade",
  dsSection3: "Que dados são processados?", dsSection4: "Subcontratantes externos",
  dsSection5: "Os seus direitos", dsSection6: "Acordo de processamento de dados",
  dsSection7: "Cookies e rastreamento",
  dsKeyPurposeLimitation: "Sem promoção automatizada ou envio em massa sem consentimento.",
  dsKeyNoTracking: "Sem cookies de rastreamento sem consentimento.",
  dsKeyAVVRequired: "É necessário um APD antes de introduzir dados de pacientes.",
  impressumSection1: "Aviso legal nos termos do § 5 DDG", impressumContactSection: "Contacto",
  impressumResponsibleSection: "Responsável pelo conteúdo nos termos do § 18 n.º 2 MStV",
  impressumLiabilitySection: "Aviso de isenção de responsabilidade",
  impressumLiabilityContent: "Responsabilidade pelo conteúdo",
  impressumLiabilityLinks: "Responsabilidade por hiperligações",
  impressumLiabilityLinksText: "A nossa oferta contém hiperligações para sítios web de terceiros sobre cujo conteúdo não temos qualquer influência.",
  avvSubtitle: "Nos termos do Art. 28 RGPD",
  avvWhySection: "Por que é necessário um APD?", avvWhenSection: "Quando preciso de um APD?",
  avvWhatSection: "O que regula o APD?", avvRequestSection: "Solicitar um APD",
  avvSubprocessorsSection: "Subcontratantes", avvDraftNotice: "RASCUNHO – documento APD ainda não finalizado.",
};

const ru: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "Дата: май 2026",
  agbTitle: "Условия использования",
  datenschutzTitle: "Политика конфиденциальности",
  impressumTitle: "Правовая информация",
  avvTitle: "Соглашение об обработке данных",
  draftNotice:
    "ЧЕРНОВИК – не имеет юридической силы. Этот текст является предварительным черновиком и ещё не прошёл полную юридическую проверку. Не является юридической консультацией.",
  authorityNotice:
    "Это неофициальный перевод для ознакомления. Немецкая версия является юридически обязательной.",
  authorityLinkLabel: "Посмотреть оригинал на немецком →",
  reviewNote: "[требует проверки]",
  importantLabel: "Важно",
  sectionPrefix: "Ст.",
  agbSection1: "Область применения", agbSection2: "Описание услуг",
  agbSection3: "Пробный период", agbSection4: "Услуги обмена сообщениями и внешние провайдеры",
  agbSection5: "Защита данных и соглашение об обработке",
  agbSection6: "Ответственность", agbSection7: "Срок договора и расторжение",
  agbSection8: "Заключительные положения",
  agbKeyB2bOnly: "SlotFill предназначен исключительно для коммерческих пользователей (медицинские и терапевтические клиники).",
  agbKeyNoSmsTrial: "В пробном режиме реальные SMS или сообщения WhatsApp не отправляются.",
  agbKeyTrialDays: "Бесплатный пробный период 14 дней. Кредитная карта не требуется.",
  agbKeyProviderOptional: "Провайдеры обмена сообщениями (например, Twilio) являются необязательными и настраиваются отдельно.",
  agbKeyNoColdOutreach: "Платформа может использоваться только для общения с пациентами, уже известными клинике. Массовые рассылки запрещены.",
  agbKeyDpaRequired: "Соглашение об обработке данных по ст. 28 GDPR обязательно перед вводом данных пациентов.",
  agbKeyGermanLaw: "Применяется немецкое законодательство. Юрисдикция: Карлсруэ, Германия.",
  dsSection1: "Контролёр данных", dsSection2: "Подход с учётом конфиденциальности",
  dsSection3: "Какие данные обрабатываются?", dsSection4: "Сторонние обработчики",
  dsSection5: "Ваши права", dsSection6: "Соглашение об обработке данных",
  dsSection7: "Файлы cookie и отслеживание",
  dsKeyPurposeLimitation: "Никакого автоматизированного холодного охвата или массовых рассылок без согласия.",
  dsKeyNoTracking: "Никаких файлов cookie для отслеживания без согласия.",
  dsKeyAVVRequired: "Соглашение об обработке данных обязательно перед вводом данных пациентов.",
  impressumSection1: "Правовая информация согласно § 5 DDG", impressumContactSection: "Контакт",
  impressumResponsibleSection: "Ответственный за содержание согласно § 18 абз. 2 MStV",
  impressumLiabilitySection: "Отказ от ответственности",
  impressumLiabilityContent: "Ответственность за содержание",
  impressumLiabilityLinks: "Ответственность за ссылки",
  impressumLiabilityLinksText: "Наш сайт содержит ссылки на сторонние веб-сайты, содержание которых мы не можем контролировать.",
  avvSubtitle: "Согласно ст. 28 GDPR",
  avvWhySection: "Почему необходимо соглашение об обработке данных?",
  avvWhenSection: "Когда мне нужно это соглашение?",
  avvWhatSection: "Что регулирует соглашение?",
  avvRequestSection: "Запросить соглашение",
  avvSubprocessorsSection: "Субобработчики", avvDraftNotice: "ЧЕРНОВИК – документ ещё не завершён.",
};

const zh: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "日期：2026年5月",
  agbTitle: "服务条款",
  datenschutzTitle: "隐私政策",
  impressumTitle: "法律声明",
  avvTitle: "数据处理协议",
  draftNotice: "草稿 – 不具法律约束力。本文件为初步草稿，尚未经律师完整审核。不构成法律建议。",
  authorityNotice: "本文为非约束性便利翻译。德语版本具有法律约束力。",
  authorityLinkLabel: "查看德语原版 →",
  reviewNote: "[待审核]",
  importantLabel: "重要",
  sectionPrefix: "第",
  agbSection1: "适用范围", agbSection2: "服务说明", agbSection3: "试用期",
  agbSection4: "消息服务与外部提供商", agbSection5: "数据保护与数据处理协议",
  agbSection6: "责任", agbSection7: "合同期限与终止", agbSection8: "最终条款",
  agbKeyB2bOnly: "SlotFill 专供商业用户（医疗和治疗诊所）使用。",
  agbKeyNoSmsTrial: "在试用模式下，不会发送真实的短信或WhatsApp消息。",
  agbKeyTrialDays: "14天免费试用期，无需信用卡。",
  agbKeyProviderOptional: "消息提供商（如 Twilio）为可选项，需由诊所单独配置。",
  agbKeyNoColdOutreach: "该平台只能用于与诊所已知患者通信，严禁大规模未经请求的发送。",
  agbKeyDpaRequired: "在输入患者数据之前，需要根据GDPR第28条签订数据处理协议。",
  agbKeyGermanLaw: "适用德国法律，司法管辖地：德国卡尔斯鲁厄。",
  dsSection1: "数据控制者", dsSection2: "隐私意识方法", dsSection3: "处理哪些数据？",
  dsSection4: "第三方处理商", dsSection5: "您的权利", dsSection6: "数据处理协议",
  dsSection7: "Cookie与追踪",
  dsKeyPurposeLimitation: "未经同意，不进行自动化冷外联或批量发送。",
  dsKeyNoTracking: "未经同意，不使用追踪Cookie。",
  dsKeyAVVRequired: "在输入患者数据之前需要数据处理协议。",
  impressumSection1: "根据DDG第5条的法律声明", impressumContactSection: "联系方式",
  impressumResponsibleSection: "根据MStV第18条第2款的内容负责人",
  impressumLiabilitySection: "免责声明", impressumLiabilityContent: "内容责任",
  impressumLiabilityLinks: "链接责任",
  impressumLiabilityLinksText: "我们的网站包含指向第三方网站的链接，我们对其内容没有影响。",
  avvSubtitle: "根据GDPR第28条", avvWhySection: "为什么需要数据处理协议？",
  avvWhenSection: "何时需要数据处理协议？", avvWhatSection: "协议规定什么内容？",
  avvRequestSection: "申请协议", avvSubprocessorsSection: "次级处理商",
  avvDraftNotice: "草稿 – 协议文件尚未完成。",
};

const hi: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "तारीख: मई 2026",
  agbTitle: "नियम और शर्तें",
  datenschutzTitle: "गोपनीयता नीति",
  impressumTitle: "कानूनी सूचना",
  avvTitle: "डेटा प्रोसेसिंग समझौता",
  draftNotice: "मसौदा – कानूनी रूप से बाध्यकारी नहीं। यह पाठ एक प्रारंभिक मसौदा है और इसे किसी वकील द्वारा पूरी तरह से समीक्षित नहीं किया गया है। यह कानूनी सलाह नहीं है।",
  authorityNotice: "यह एक गैर-बाध्यकारी सुविधा अनुवाद है। जर्मन संस्करण कानूनी रूप से आधिकारिक है।",
  authorityLinkLabel: "जर्मन मूल संस्करण देखें →",
  reviewNote: "[समीक्षा की आवश्यकता है]",
  importantLabel: "महत्वपूर्ण",
  sectionPrefix: "अनु.",
  agbSection1: "दायरा", agbSection2: "सेवा विवरण", agbSection3: "परीक्षण अवधि",
  agbSection4: "संदेश सेवाएं और बाहरी प्रदाता", agbSection5: "डेटा सुरक्षा और प्रसंस्करण समझौता",
  agbSection6: "दायित्व", agbSection7: "अनुबंध अवधि और समाप्ति", agbSection8: "अंतिम प्रावधान",
  agbKeyB2bOnly: "SlotFill विशेष रूप से व्यावसायिक उपयोगकर्ताओं (चिकित्सा और थेरेपी क्लीनिक) के लिए है।",
  agbKeyNoSmsTrial: "परीक्षण मोड में कोई वास्तविक SMS या WhatsApp संदेश नहीं भेजे जाते।",
  agbKeyTrialDays: "14 दिन का मुफ्त परीक्षण। क्रेडिट कार्ड की आवश्यकता नहीं।",
  agbKeyProviderOptional: "मैसेजिंग प्रदाता (जैसे Twilio) वैकल्पिक हैं और अलग से कॉन्फ़िगर किए जाते हैं।",
  agbKeyNoColdOutreach: "प्लेटफ़ॉर्म का उपयोग केवल क्लिनिक के ज्ञात रोगियों के साथ संचार के लिए किया जा सकता है।",
  agbKeyDpaRequired: "रोगी डेटा दर्ज करने से पहले GDPR अनुच्छेद 28 के तहत DPA आवश्यक है।",
  agbKeyGermanLaw: "जर्मन कानून लागू होता है। न्यायिक क्षेत्राधिकार: कार्लस्रुहे, जर्मनी।",
  dsSection1: "डेटा नियंत्रक", dsSection2: "गोपनीयता-जागरूक दृष्टिकोण",
  dsSection3: "कौन सा डेटा संसाधित होता है?", dsSection4: "तृतीय-पक्ष प्रोसेसर",
  dsSection5: "डेटा विषय के रूप में आपके अधिकार", dsSection6: "डेटा प्रोसेसिंग समझौता",
  dsSection7: "कुकीज़ और ट्रैकिंग",
  dsKeyPurposeLimitation: "बिना सहमति के कोई स्वचालित कोल्ड आउटरीच या बल्क मैसेजिंग नहीं।",
  dsKeyNoTracking: "बिना सहमति के कोई ट्रैकिंग कुकीज़ नहीं।",
  dsKeyAVVRequired: "रोगी डेटा दर्ज करने से पहले DPA आवश्यक है।",
  impressumSection1: "§ 5 DDG के अनुसार कानूनी नोटिस", impressumContactSection: "संपर्क",
  impressumResponsibleSection: "§ 18 (2) MStV के अनुसार सामग्री के लिए जिम्मेदार",
  impressumLiabilitySection: "अस्वीकरण", impressumLiabilityContent: "सामग्री के लिए दायित्व",
  impressumLiabilityLinks: "लिंक के लिए दायित्व",
  impressumLiabilityLinksText: "हमारी वेबसाइट में तृतीय-पक्ष वेबसाइटों के लिंक शामिल हैं जिनकी सामग्री पर हमारा कोई नियंत्रण नहीं है।",
  avvSubtitle: "GDPR अनुच्छेद 28 के अनुसार",
  avvWhySection: "DPA क्यों आवश्यक है?", avvWhenSection: "मुझे DPA की कब आवश्यकता है?",
  avvWhatSection: "DPA क्या नियंत्रित करता है?", avvRequestSection: "DPA का अनुरोध करें",
  avvSubprocessorsSection: "उप-प्रोसेसर", avvDraftNotice: "मसौदा – DPA दस्तावेज़ अभी तक अंतिम रूप नहीं दिया गया है।",
};

const bn: LegalLocaleData = {
  dir: "ltr",
  backLabel: "SlotFill",
  standDate: "তারিখ: মে ২০২৬",
  agbTitle: "শর্তাবলী",
  datenschutzTitle: "গোপনীয়তা নীতি",
  impressumTitle: "আইনি নোটিশ",
  avvTitle: "ডেটা প্রক্রিয়াকরণ চুক্তি",
  draftNotice: "খসড়া – আইনিভাবে বাধ্যকর নয়। এই পাঠ্যটি একটি প্রাথমিক খসড়া এবং এখনও কোনও আইনজীবী দ্বারা সম্পূর্ণরূপে পর্যালোচনা করা হয়নি। এটি আইনি পরামর্শ নয়।",
  authorityNotice: "এটি একটি অ-বাধ্যতামূলক সুবিধার অনুবাদ। জার্মান সংস্করণটি আইনিভাবে কর্তৃত্বশালী।",
  authorityLinkLabel: "জার্মান মূল সংস্করণ দেখুন →",
  reviewNote: "[পর্যালোচনা প্রয়োজন]",
  importantLabel: "গুরুত্বপূর্ণ",
  sectionPrefix: "অনু.",
  agbSection1: "প্রযোজ্যতার ক্ষেত্র", agbSection2: "পরিষেবার বিবরণ", agbSection3: "ট্রায়াল পিরিয়ড",
  agbSection4: "মেসেজিং পরিষেবা", agbSection5: "ডেটা সুরক্ষা",
  agbSection6: "দায়বদ্ধতা", agbSection7: "চুক্তির মেয়াদ", agbSection8: "চূড়ান্ত বিধান",
  agbKeyB2bOnly: "SlotFill শুধুমাত্র বাণিজ্যিক ব্যবহারকারীদের জন্য।",
  agbKeyNoSmsTrial: "ট্রায়াল মোডে কোনো বাস্তব SMS বা WhatsApp বার্তা পাঠানো হয় না।",
  agbKeyTrialDays: "১৪ দিনের বিনামূল্যে ট্রায়াল। ক্রেডিট কার্ডের প্রয়োজন নেই।",
  agbKeyProviderOptional: "মেসেজিং প্রদানকারীরা ঐচ্ছিক এবং আলাদাভাবে কনফিগার করা হয়।",
  agbKeyNoColdOutreach: "প্ল্যাটফর্মটি শুধুমাত্র পরিচিত রোগীদের সাথে যোগাযোগের জন্য ব্যবহার করা যাবে।",
  agbKeyDpaRequired: "রোগীর ডেটা প্রবেশ করার আগে GDPR অনুচ্ছেদ ২৮ অনুযায়ী DPA প্রয়োজন।",
  agbKeyGermanLaw: "জার্মান আইন প্রযোজ্য। এখতিয়ার: কার্লসরুহে, জার্মানি।",
  dsSection1: "ডেটা নিয়ন্ত্রক", dsSection2: "গোপনীয়তা-সচেতন পদ্ধতি",
  dsSection3: "কোন ডেটা প্রক্রিয়া করা হয়?", dsSection4: "তৃতীয় পক্ষের প্রক্রিয়াকারী",
  dsSection5: "আপনার অধিকার", dsSection6: "ডেটা প্রক্রিয়াকরণ চুক্তি",
  dsSection7: "কুকি এবং ট্র্যাকিং",
  dsKeyPurposeLimitation: "সম্মতি ছাড়া কোনো স্বয়ংক্রিয় কোল্ড আউটরিচ বা বাল্ক মেসেজিং নেই।",
  dsKeyNoTracking: "সম্মতি ছাড়া কোনো ট্র্যাকিং কুকি নেই।",
  dsKeyAVVRequired: "রোগীর ডেটা প্রবেশের আগে DPA প্রয়োজন।",
  impressumSection1: "§ 5 DDG অনুযায়ী আইনি নোটিশ", impressumContactSection: "যোগাযোগ",
  impressumResponsibleSection: "§ 18 (2) MStV অনুযায়ী বিষয়বস্তুর জন্য দায়ী",
  impressumLiabilitySection: "দায়বদ্ধতা অস্বীকৃতি", impressumLiabilityContent: "বিষয়বস্তুর জন্য দায়বদ্ধতা",
  impressumLiabilityLinks: "লিঙ্কের জন্য দায়বদ্ধতা",
  impressumLiabilityLinksText: "আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইটের লিঙ্ক রয়েছে যার বিষয়বস্তুর উপর আমাদের কোনো প্রভাব নেই।",
  avvSubtitle: "GDPR অনুচ্ছেদ ২৮ অনুযায়ী",
  avvWhySection: "কেন DPA প্রয়োজন?", avvWhenSection: "কখন DPA প্রয়োজন?",
  avvWhatSection: "DPA কী নিয়ন্ত্রণ করে?", avvRequestSection: "DPA অনুরোধ করুন",
  avvSubprocessorsSection: "উপ-প্রক্রিয়াকারী", avvDraftNotice: "খসড়া – DPA নথি এখনও চূড়ান্ত করা হয়নি।",
};

/** Alle unterstützten Locales mit ihren Daten. */
export const LEGAL_LOCALES: Record<LegalLocale, LegalLocaleData> = {
  de,
  en,
  fr,
  es,
  ar,
  pt,
  ru,
  zh,
  hi,
  bn,
};

/**
 * Gibt die LegalLocaleData für eine Locale zurück.
 * Fällt auf Englisch zurück, wenn die Locale nicht bekannt ist.
 */
export function getLegalContent(locale: string): LegalLocaleData {
  return LEGAL_LOCALES[locale as LegalLocale] ?? en;
}

/**
 * Gibt true zurück, wenn die Legal-Seiten als ENTWURF markiert bleiben sollen.
 * Kann über env-Variable LEGAL_REVIEW_APPROVED=true deaktiviert werden.
 */
export function isLegalDraft(): boolean {
  return process.env.LEGAL_REVIEW_APPROVED !== "true";
}

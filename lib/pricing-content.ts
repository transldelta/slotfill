/**
 * Localized pricing / clinic-access content for all 10 public locales.
 *
 * READ-ONLY data. No prices here (prices come from the plans API). This module
 * removes English-leak content from non-en/de pricing cards and any trial wording.
 * en/de are the verified base; the other 8 are model-localized (needs_review,
 * see lib/locale-quality.ts). ClinicSlotHub stays the brand name.
 */

export type PlanKey = "starter" | "professional" | "praxis_plus";

export interface PricingContent {
  header: string;
  intro: string;
  planName: Record<PlanKey, string>;
  subtitle: Record<PlanKey, string>;
  features: Record<PlanKey, string[]>;
  badgeRecommended: string;
  badgePremium: string;
  requestAccess: string;
  featuresLabel: string;
  priceLogicNote: string;
}

const EN: PricingContent = {
  header: "Clinic access plans",
  intro: "Simple plans for clinics that organize patient requests in one waitlist.",
  planName: { starter: "Starter", professional: "Professional", praxis_plus: "Clinic Pro" },
  subtitle: {
    starter: "For a single clinic getting started with patient requests.",
    professional: "For clinic teams with a regular volume of requests.",
    praxis_plus: "For larger clinics and organizations with high request volume.",
  },
  features: {
    starter: ["Public request link for your clinic", "Patient requests without login", "One simple waitlist"],
    professional: ["Everything in Starter", "Workflow for multiple staff", "Request and status overview"],
    praxis_plus: ["Everything in Professional", "For multiple practitioners", "Priority setup and support"],
  },
  badgeRecommended: "Recommended",
  badgePremium: "Premium",
  requestAccess: "Request access",
  featuresLabel: "Included",
  priceLogicNote:
    "Pricing may depend on clinic size, country and activation scope. Final pricing is confirmed before activation.",
};

const DE: PricingContent = {
  header: "Klinik-Zugangspläne",
  intro: "Einfache Pläne für Kliniken, die Patientenanfragen in einer Warteliste organisieren.",
  planName: { starter: "Einstieg", professional: "Professionell", praxis_plus: "Klinik Pro" },
  subtitle: {
    starter: "Für eine einzelne Klinik, die mit Patientenanfragen startet.",
    professional: "Für Klinik-Teams mit regelmäßigem Anfragevolumen.",
    praxis_plus: "Für größere Kliniken und Organisationen mit hohem Anfragevolumen.",
  },
  features: {
    starter: ["Öffentlicher Anfrage-Link für Ihre Klinik", "Patientenanfragen ohne Login", "Eine einfache Warteliste"],
    professional: ["Alles aus Einstieg", "Workflow für mehrere Mitarbeitende", "Anfrage- und Status-Übersicht"],
    praxis_plus: ["Alles aus Professionell", "Für mehrere Behandler", "Vorrang bei Einrichtung und Support"],
  },
  badgeRecommended: "Empfohlen",
  badgePremium: "Premium",
  requestAccess: "Zugang anfragen",
  featuresLabel: "Enthalten",
  priceLogicNote:
    "Der Preis kann von Klinikgröße, Land und Aktivierungsumfang abhängen. Der endgültige Preis wird vor der Aktivierung bestätigt.",
};

const FR: PricingContent = {
  header: "Plans d'accès pour cliniques",
  intro: "Des plans simples pour les cliniques qui organisent les demandes des patients dans une liste d'attente.",
  planName: { starter: "Démarrage", professional: "Professionnel", praxis_plus: "Clinique Pro" },
  subtitle: {
    starter: "Pour une seule clinique qui démarre avec les demandes des patients.",
    professional: "Pour les équipes de clinique avec un volume régulier de demandes.",
    praxis_plus: "Pour les grandes cliniques et organisations à fort volume de demandes.",
  },
  features: {
    starter: ["Lien de demande public pour votre clinique", "Demandes des patients sans connexion", "Une simple liste d'attente"],
    professional: ["Tout de Démarrage", "Flux de travail pour plusieurs membres du personnel", "Vue des demandes et des statuts"],
    praxis_plus: ["Tout de Professionnel", "Pour plusieurs praticiens", "Configuration et assistance prioritaires"],
  },
  badgeRecommended: "Recommandé",
  badgePremium: "Premium",
  requestAccess: "Demander l'accès",
  featuresLabel: "Inclus",
  priceLogicNote:
    "Le tarif peut dépendre de la taille de la clinique, du pays et de la portée de l'activation. Le tarif final est confirmé avant l'activation.",
};

const ES: PricingContent = {
  header: "Planes de acceso para clínicas",
  intro: "Planes simples para clínicas que organizan las solicitudes de pacientes en una lista de espera.",
  planName: { starter: "Inicio", professional: "Profesional", praxis_plus: "Clínica Pro" },
  subtitle: {
    starter: "Para una sola clínica que empieza con las solicitudes de pacientes.",
    professional: "Para equipos de clínica con un volumen regular de solicitudes.",
    praxis_plus: "Para clínicas y organizaciones más grandes con alto volumen de solicitudes.",
  },
  features: {
    starter: ["Enlace de solicitud público para su clínica", "Solicitudes de pacientes sin inicio de sesión", "Una lista de espera simple"],
    professional: ["Todo lo de Inicio", "Flujo de trabajo para varios miembros del personal", "Vista de solicitudes y estados"],
    praxis_plus: ["Todo lo de Profesional", "Para varios profesionales", "Configuración y soporte prioritarios"],
  },
  badgeRecommended: "Recomendado",
  badgePremium: "Premium",
  requestAccess: "Solicitar acceso",
  featuresLabel: "Incluido",
  priceLogicNote:
    "El precio puede depender del tamaño de la clínica, el país y el alcance de la activación. El precio final se confirma antes de la activación.",
};

const PT: PricingContent = {
  header: "Planos de acesso para clínicas",
  intro: "Planos simples para clínicas que organizam os pedidos de pacientes numa lista de espera.",
  planName: { starter: "Início", professional: "Profissional", praxis_plus: "Clínica Pro" },
  subtitle: {
    starter: "Para uma única clínica que está a começar com os pedidos de pacientes.",
    professional: "Para equipas de clínica com um volume regular de pedidos.",
    praxis_plus: "Para clínicas e organizações maiores com alto volume de pedidos.",
  },
  features: {
    starter: ["Link de pedido público para a sua clínica", "Pedidos de pacientes sem login", "Uma lista de espera simples"],
    professional: ["Tudo do Início", "Fluxo de trabalho para vários colaboradores", "Visão de pedidos e estados"],
    praxis_plus: ["Tudo do Profissional", "Para vários profissionais", "Configuração e suporte prioritários"],
  },
  badgeRecommended: "Recomendado",
  badgePremium: "Premium",
  requestAccess: "Solicitar acesso",
  featuresLabel: "Incluído",
  priceLogicNote:
    "O preço pode depender do tamanho da clínica, do país e do âmbito de ativação. O preço final é confirmado antes da ativação.",
};

const AR: PricingContent = {
  header: "باقات الوصول للعيادات",
  intro: "باقات بسيطة للعيادات التي تنظّم طلبات المرضى في قائمة انتظار واحدة.",
  planName: { starter: "الأساسية", professional: "الاحترافية", praxis_plus: "المتقدمة" },
  subtitle: {
    starter: "لعيادة واحدة تبدأ في استقبال طلبات المرضى.",
    professional: "لفِرَق العيادات ذات حجم طلبات منتظم.",
    praxis_plus: "للعيادات والمؤسسات الأكبر ذات حجم الطلبات المرتفع.",
  },
  features: {
    starter: ["رابط طلب عام لعيادتك", "طلبات المرضى بدون تسجيل دخول", "قائمة انتظار بسيطة واحدة"],
    professional: ["كل ما في خطة البداية", "سير عمل لعدة موظفين", "عرض للطلبات والحالات"],
    praxis_plus: ["كل ما في الخطة الاحترافية", "لعدة أطباء", "أولوية في الإعداد والدعم"],
  },
  badgeRecommended: "موصى به",
  badgePremium: "متميّزة",
  requestAccess: "اطلب الوصول",
  featuresLabel: "يشمل",
  priceLogicNote:
    "قد يعتمد السعر على حجم العيادة والدولة ونطاق التفعيل. يتم تأكيد السعر النهائي قبل التفعيل.",
};

const HI: PricingContent = {
  header: "क्लीनिक एक्सेस प्लान",
  intro: "उन क्लीनिकों के लिए सरल प्लान जो मरीज़ अनुरोधों को एक प्रतीक्षा-सूची में व्यवस्थित करते हैं।",
  planName: { starter: "स्टार्टर", professional: "प्रोफेशनल", praxis_plus: "क्लीनिक प्रो" },
  subtitle: {
    starter: "एक अकेले क्लीनिक के लिए जो मरीज़ अनुरोधों के साथ शुरुआत कर रहा है।",
    professional: "नियमित अनुरोध मात्रा वाले क्लीनिक टीमों के लिए।",
    praxis_plus: "अधिक अनुरोध मात्रा वाले बड़े क्लीनिकों और संगठनों के लिए।",
  },
  features: {
    starter: ["आपके क्लीनिक के लिए सार्वजनिक अनुरोध लिंक", "बिना लॉगिन मरीज़ अनुरोध", "एक सरल प्रतीक्षा-सूची"],
    professional: ["स्टार्टर की सभी सुविधाएँ", "कई कर्मचारियों के लिए वर्कफ़्लो", "अनुरोध और स्थिति का अवलोकन"],
    praxis_plus: ["प्रोफेशनल की सभी सुविधाएँ", "कई चिकित्सकों के लिए", "प्राथमिकता सेटअप और समर्थन"],
  },
  badgeRecommended: "अनुशंसित",
  badgePremium: "प्रीमियम",
  requestAccess: "पहुँच का अनुरोध करें",
  featuresLabel: "शामिल",
  priceLogicNote:
    "कीमत क्लीनिक के आकार, देश और सक्रियण के दायरे पर निर्भर कर सकती है। अंतिम कीमत सक्रियण से पहले पुष्टि की जाती है।",
};

const BN: PricingContent = {
  header: "ক্লিনিক অ্যাক্সেস প্ল্যান",
  intro: "যেসব ক্লিনিক রোগী অনুরোধ একটি অপেক্ষমাণ-তালিকায় সংগঠিত করে তাদের জন্য সরল প্ল্যান।",
  planName: { starter: "স্টার্টার", professional: "প্রফেশনাল", praxis_plus: "ক্লিনিক প্রো" },
  subtitle: {
    starter: "একটি একক ক্লিনিকের জন্য যা রোগী অনুরোধ দিয়ে শুরু করছে।",
    professional: "নিয়মিত অনুরোধের পরিমাণ থাকা ক্লিনিক দলের জন্য।",
    praxis_plus: "বেশি অনুরোধের পরিমাণ থাকা বড় ক্লিনিক ও সংস্থার জন্য।",
  },
  features: {
    starter: ["আপনার ক্লিনিকের জন্য পাবলিক অনুরোধ লিঙ্ক", "লগইন ছাড়াই রোগী অনুরোধ", "একটি সরল অপেক্ষমাণ-তালিকা"],
    professional: ["স্টার্টারের সব কিছু", "একাধিক কর্মীর জন্য ওয়ার্কফ্লো", "অনুরোধ ও স্ট্যাটাস ওভারভিউ"],
    praxis_plus: ["প্রফেশনালের সব কিছু", "একাধিক চিকিৎসকের জন্য", "অগ্রাধিকার সেটআপ ও সহায়তা"],
  },
  badgeRecommended: "প্রস্তাবিত",
  badgePremium: "প্রিমিয়াম",
  requestAccess: "অ্যাক্সেসের অনুরোধ করুন",
  featuresLabel: "অন্তর্ভুক্ত",
  priceLogicNote:
    "মূল্য ক্লিনিকের আকার, দেশ ও সক্রিয়করণের পরিসরের উপর নির্ভর করতে পারে। চূড়ান্ত মূল্য সক্রিয়করণের আগে নিশ্চিত করা হয়।",
};

const RU: PricingContent = {
  header: "Планы доступа для клиник",
  intro: "Простые планы для клиник, которые собирают заявки пациентов в одном листе ожидания.",
  planName: { starter: "Старт", professional: "Профессиональный", praxis_plus: "Клиника Про" },
  subtitle: {
    starter: "Для одной клиники, которая начинает работать с заявками пациентов.",
    professional: "Для команд клиник с регулярным объёмом заявок.",
    praxis_plus: "Для крупных клиник и организаций с высоким объёмом заявок.",
  },
  features: {
    starter: ["Публичная ссылка для заявок вашей клиники", "Заявки пациентов без входа", "Один простой лист ожидания"],
    professional: ["Всё из «Старт»", "Рабочий процесс для нескольких сотрудников", "Обзор заявок и статусов"],
    praxis_plus: ["Всё из «Профессиональный»", "Для нескольких специалистов", "Приоритетная настройка и поддержка"],
  },
  badgeRecommended: "Рекомендуем",
  badgePremium: "Премиум",
  requestAccess: "Запросить доступ",
  featuresLabel: "Включено",
  priceLogicNote:
    "Цена может зависеть от размера клиники, страны и объёма активации. Окончательная цена подтверждается до активации.",
};

const ZH: PricingContent = {
  header: "诊所接入方案",
  intro: "为将患者请求集中到一个候补名单中的诊所提供的简单方案。",
  planName: { starter: "入门版", professional: "专业版", praxis_plus: "诊所专业版" },
  subtitle: {
    starter: "适合刚开始处理患者请求的单个诊所。",
    professional: "适合有稳定请求量的诊所团队。",
    praxis_plus: "适合请求量大的大型诊所和机构。",
  },
  features: {
    starter: ["为您的诊所提供公开请求链接", "无需登录的患者请求", "一个简单的候补名单"],
    professional: ["包含入门版的全部", "支持多名员工的工作流程", "请求与状态概览"],
    praxis_plus: ["包含专业版的全部", "支持多位医生", "优先设置与支持"],
  },
  badgeRecommended: "推荐",
  badgePremium: "高级",
  requestAccess: "申请访问权限",
  featuresLabel: "包含",
  priceLogicNote: "价格可能取决于诊所规模、国家和启用范围。最终价格在启用前确认。",
};

const CONTENT: Record<string, PricingContent> = { en: EN, de: DE, fr: FR, es: ES, pt: PT, ar: AR, hi: HI, bn: BN, ru: RU, zh: ZH };

/** Returns localized pricing content. Falls back to EN only for truly unknown locales. */
export function getPricingContent(locale: string): PricingContent {
  return CONTENT[locale] ?? EN;
}

export const PRICING_LOCALES = Object.keys(CONTENT);

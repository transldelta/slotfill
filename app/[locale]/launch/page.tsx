import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Mail, Globe, ArrowRight, Info, UserCheck, LayoutDashboard, Link as LinkIcon } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CANONICAL_URL } from "@/lib/brand";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ─── Lokalisierter Inhalt ─────────────────────────────────────────────────────

type LaunchContent = {
  dir: "ltr" | "rtl";
  badge: string;
  headline: string;
  subline: string;
  problem: string;
  solution: string;
  whatWorks: string;
  features: string[];
  statusTitle: string;
  status: string;
  trialNote: string;
  legalNote: string;
  ctaTrial: string;
  ctaContact: string;
  ctaBook: string;
  ogTitle: string;
  ogDesc: string;
};

const CONTENT: Record<string, LaunchContent> = {
  de: {
    dir: "ltr",
    badge: "Globaler öffentlicher Soft Launch · Juni 2026",
    headline: "ClinicSlotHub – jetzt weltweit verfügbar",
    subline:
      "Eine internationale Plattform für Praxen, Kliniken, Therapiezentren und Healthcare Provider, die Terminanfragen, Wartelisten und freie Zeitfenster strukturierter verwalten möchten.",
    problem:
      "Viele Praxen verlieren täglich Zeit, weil Terminabsagen manuell koordiniert werden: Warteliste durchgehen, Patienten anrufen, hoffen, dass jemand kurzfristig kommt. Das kostet Personal und führt zu unnötigen Leerterminkosten.",
    solution:
      "ClinicSlotHub digitalisiert diesen Prozess: Jede Praxis erhält einen eigenen öffentlichen Buchungslink, den sie auf ihrer Webseite, per E-Mail oder als QR-Code teilen kann. Patienten senden ohne Login eine Anfrage; die Praxis sieht diese Anfrage im Dashboard und kann sie bestätigen oder ablehnen. Bei einem freien Termin benachrichtigt die Praxis passende Patienten per E-Mail – in wenigen Klicks, ohne Telefonliste.",
    whatWorks: "Was aktuell funktioniert:",
    features: [
      "Eigener öffentlicher Buchungslink pro Praxis – teilbar via Website, E-Mail oder QR-Code",
      "Patienten senden Anfrage ohne Login – kein Konto, kein Aufwand",
      "Anfragen im Dashboard bestätigen oder ablehnen",
      "Digitale Warteliste mit strukturierten Patientenprofilen",
      "E-Mail-Benachrichtigungen live (via Resend)",
      "Mehrsprachige Oberfläche in 10 Sprachen",
      "14 Tage kostenlos testen, keine Kreditkarte",
    ],
    statusTitle: "Aktueller Status",
    status:
      "Öffentlicher Soft Launch. Keine zahlenden Kunden bisher. Kein Versprechen auf schnelle Erfolge. Ein funktionierendes Live-Produkt, das jetzt von echten Praxen getestet und verbessert werden soll.",
    trialNote: "Registrierung ist vollständig selbstservice – keine Einladung nötig.",
    legalNote:
      "Hinweis: Lokale rechtliche und datenschutzrechtliche Anforderungen (z. B. AVV gemäß Art. 28 DSGVO) sollten vor dem produktiven Einsatz mit echten Patientendaten geprüft werden.",
    ctaTrial: "Kostenlos testen",
    ctaContact: "Kontakt aufnehmen",
    ctaBook: "Terminanfrage testen",
    ogTitle: "ClinicSlotHub – Globaler Soft Launch",
    ogDesc:
      "Mehrsprachige Plattform für Terminanfragen und Wartelisten – jetzt öffentlich verfügbar. 14 Tage kostenlos.",
  },
  en: {
    dir: "ltr",
    badge: "Global Public Soft Launch · June 2026",
    headline: "ClinicSlotHub – now available worldwide",
    subline:
      "An international appointment and waitlist management SaaS for clinics, medical practices, therapy centers and healthcare providers worldwide.",
    problem:
      "Many practices lose time every day because cancellations are coordinated manually: go through the waitlist, call patients, hope someone is available at short notice. This costs staff time and leads to avoidable empty slots.",
    solution:
      "ClinicSlotHub digitalizes this process: each practice gets its own public booking link that can be shared on a website, by email or as a QR code. Patients submit a request without logging in; the practice sees the request in the dashboard and can confirm or decline it. When a slot opens, the practice notifies matching patients by email — in a few clicks, no phone list needed.",
    whatWorks: "What is working right now:",
    features: [
      "Own public booking link per practice – shareable via website, email or QR code",
      "Patients submit requests without logging in – no account, no friction",
      "Confirm or decline requests directly in the dashboard",
      "Digital waitlist with structured patient profiles",
      "Live email notifications (via Resend)",
      "Multilingual interface in 10 languages",
      "14-day free trial, no credit card required",
    ],
    statusTitle: "Current status",
    status:
      "Public soft launch. No paying customers yet. No promises of quick wins. A working live product that is now being tested and improved by real practices.",
    trialNote: "Registration is fully self-service — no invitation needed.",
    legalNote:
      "Note: Local legal and data protection requirements (e.g. a Data Processing Agreement under GDPR Art. 28) should be reviewed before productive use with real patient data.",
    ctaTrial: "Try for free",
    ctaContact: "Get in touch",
    ctaBook: "Test the booking form",
    ogTitle: "ClinicSlotHub – Global Soft Launch",
    ogDesc:
      "Multilingual appointment and waitlist SaaS for clinics – now publicly available. 14-day free trial.",
  },
  fr: {
    dir: "ltr",
    badge: "Lancement public mondial · Juin 2026",
    headline: "ClinicSlotHub – maintenant disponible dans le monde entier",
    subline:
      "Une plateforme internationale pour les cliniques, cabinets médicaux, centres de soins et professionnels de santé souhaitant gérer plus efficacement les demandes de rendez-vous et les listes d'attente.",
    problem:
      "De nombreux cabinets perdent du temps chaque jour parce que les annulations sont gérées manuellement : parcourir la liste d'attente, appeler les patients, espérer qu'un créneau se remplisse. Cela coûte du temps et génère des créneaux vides évitables.",
    solution:
      "ClinicSlotHub digitalise ce processus : les patients s'inscrivent eux-mêmes via un lien de réservation partageable. Quand un créneau se libère, le cabinet notifie les patients correspondants par e-mail ou SMS/WhatsApp optionnel — en quelques clics.",
    whatWorks: "Ce qui fonctionne dès maintenant :",
    features: [
      "Liste d'attente numérique avec profils patients structurés",
      "Lien de réservation propre par cabinet – partageable par site web, e-mail ou QR code (sans compte patient)",
      "Notifications e-mail en temps réel (via Resend)",
      "Notifications SMS/WhatsApp optionnelles (via Twilio)",
      "Interface multilingue en 10 langues",
      "Conception respectueuse de la vie privée – pas de tracking, DPA sur demande",
      "14 jours d'essai gratuit, sans carte bancaire",
    ],
    statusTitle: "Statut actuel",
    status:
      "Lancement public. Pas encore de clients payants. Un produit fonctionnel maintenant testé et amélioré par de vraies pratiques.",
    trialNote: "L'inscription est entièrement en libre-service — aucune invitation requise.",
    legalNote:
      "Note : Les exigences légales et de protection des données locales (p. ex. un accord de traitement des données selon le RGPD Art. 28) doivent être vérifiées avant toute utilisation productive avec de vraies données patients.",
    ctaTrial: "Essayer gratuitement",
    ctaContact: "Nous contacter",
    ctaBook: "Tester le formulaire de réservation",
    ogTitle: "ClinicSlotHub – Lancement mondial",
    ogDesc:
      "Plateforme multilingue de gestion des rendez-vous et listes d'attente – maintenant disponible. Essai gratuit 14 jours.",
  },
  es: {
    dir: "ltr",
    badge: "Lanzamiento público global · Junio 2026",
    headline: "ClinicSlotHub – ya disponible en todo el mundo",
    subline:
      "Una plataforma internacional para clínicas, consultorios médicos, centros de salud y proveedores de servicios sanitarios que desean gestionar solicitudes de citas y listas de espera de forma más eficiente.",
    problem:
      "Muchos consultorios pierden tiempo cada día porque las cancelaciones se coordinan manualmente: revisar la lista de espera, llamar a los pacientes, esperar que alguien esté disponible con poca anticipación.",
    solution:
      "ClinicSlotHub digitaliza este proceso: los pacientes se añaden a la lista de espera a través de un enlace de reserva compartible. Cuando se libera un espacio, el consultorio notifica a los pacientes adecuados por correo electrónico o SMS/WhatsApp opcional.",
    whatWorks: "Qué funciona ahora mismo:",
    features: [
      "Lista de espera digital con perfiles de pacientes estructurados",
      "Enlace de reserva propio por consultorio – compartible por web, e-mail o código QR (sin cuenta de paciente)",
      "Notificaciones por correo en tiempo real (via Resend)",
      "Notificaciones SMS/WhatsApp opcionales (via Twilio)",
      "Interfaz multilingüe en 10 idiomas",
      "Diseño respetuoso con la privacidad – sin seguimiento, DPA disponible",
      "14 días de prueba gratuita, sin tarjeta de crédito",
    ],
    statusTitle: "Estado actual",
    status:
      "Lanzamiento público. Sin clientes de pago todavía. Un producto funcional en vivo, siendo probado y mejorado por consultorios reales.",
    trialNote: "El registro es completamente de autoservicio — no se necesita invitación.",
    legalNote:
      "Nota: Los requisitos legales y de protección de datos locales deben revisarse antes del uso productivo con datos reales de pacientes.",
    ctaTrial: "Probar gratis",
    ctaContact: "Contactar",
    ctaBook: "Probar el formulario de reserva",
    ogTitle: "ClinicSlotHub – Lanzamiento global",
    ogDesc:
      "Plataforma SaaS multilingüe para clínicas – ya disponible. 14 días de prueba gratuita.",
  },
  pt: {
    dir: "ltr",
    badge: "Lançamento público global · Junho 2026",
    headline: "ClinicSlotHub – agora disponível em todo o mundo",
    subline:
      "Uma plataforma internacional para clínicas, consultórios médicos, centros de saúde e prestadores de serviços de saúde que desejam gerir pedidos de consultas e listas de espera de forma mais eficiente.",
    problem:
      "Muitos consultórios perdem tempo todos os dias porque os cancelamentos são coordenados manualmente: rever a lista de espera, ligar aos pacientes, esperar que alguém esteja disponível com pouca antecedência.",
    solution:
      "ClinicSlotHub digitaliza este processo: os pacientes inscrevem-se através de um link de reserva partilhável. Quando um slot fica livre, o consultório notifica os pacientes adequados por e-mail ou SMS/WhatsApp opcional.",
    whatWorks: "O que funciona agora:",
    features: [
      "Lista de espera digital com perfis de pacientes estruturados",
      "Link de reserva próprio por consultório – partilhável por site, e-mail ou código QR (sem conta de paciente)",
      "Notificações por e-mail em tempo real (via Resend)",
      "Notificações SMS/WhatsApp opcionais (via Twilio)",
      "Interface multilingue em 10 idiomas",
      "Design respeitador da privacidade – sem rastreamento, DPA disponível",
      "14 dias de teste gratuito, sem cartão de crédito",
    ],
    statusTitle: "Estado atual",
    status:
      "Lançamento público. Sem clientes pagantes ainda. Um produto funcional a ser testado e melhorado por consultórios reais.",
    trialNote: "O registo é totalmente self-service — não é necessário convite.",
    legalNote:
      "Nota: Os requisitos legais e de proteção de dados locais devem ser verificados antes da utilização produtiva com dados reais de pacientes.",
    ctaTrial: "Experimentar gratuitamente",
    ctaContact: "Entrar em contacto",
    ctaBook: "Testar o formulário de reserva",
    ogTitle: "ClinicSlotHub – Lançamento global",
    ogDesc:
      "Plataforma SaaS multilingue para clínicas – agora disponível. 14 dias de teste gratuito.",
  },
  zh: {
    dir: "ltr",
    badge: "全球公开软启动 · 2026年6月",
    headline: "ClinicSlotHub – 现已面向全球开放",
    subline: "面向诊所、医疗机构、治疗中心和医疗服务提供者的国际化预约与候补名单管理平台。",
    problem:
      "许多诊所每天因手动协调取消预约而损失时间：逐一查看候补名单、给患者打电话、希望有人能临时前来。这耗费了员工时间，并导致不必要的空档损失。",
    solution:
      "ClinicSlotHub 将此流程数字化：患者通过可分享的预约链接加入候补名单。当有空档时，诊所只需几次点击即可通过电子邮件（或可选的短信/WhatsApp）通知合适的患者。",
    whatWorks: "当前可用功能：",
    features: [
      "带结构化患者档案的数字候补名单",
      "每家诊所拥有独立的公开预约链接 – 可通过网站、邮件或二维码分享（患者无需注册）",
      "实时电子邮件通知（通过 Resend）",
      "可选短信/WhatsApp 通知（通过 Twilio）",
      "支持 10 种语言的多语言界面",
      "隐私保护设计 — 无追踪，可按需提供数据处理协议",
      "14 天免费试用，无需信用卡",
    ],
    statusTitle: "当前状态",
    status:
      "公开软启动阶段。目前无付费用户。这是一个功能完整的在线产品，正由真实诊所进行测试和改进。",
    trialNote: "注册完全自助服务 — 无需邀请。",
    legalNote: "注意：在正式使用真实患者数据之前，请审查当地适用的法律和数据保护要求。",
    ctaTrial: "免费试用",
    ctaContact: "联系我们",
    ctaBook: "测试预约表单",
    ogTitle: "ClinicSlotHub – 全球软启动",
    ogDesc: "面向诊所的多语言预约与候补名单 SaaS — 现已上线。14 天免费试用。",
  },
  hi: {
    dir: "ltr",
    badge: "वैश्विक सार्वजनिक सॉफ्ट लॉन्च · जून 2026",
    headline: "ClinicSlotHub – अब दुनिया भर में उपलब्ध",
    subline:
      "क्लिनिक, मेडिकल प्रैक्टिस, थेरेपी सेंटर और हेल्थकेयर प्रोवाइडर के लिए एक अंतरराष्ट्रीय अपॉइंटमेंट और वेटलिस्ट प्रबंधन प्लेटफ़ॉर्म।",
    problem:
      "कई प्रैक्टिस रोज़ाना समय खोती हैं क्योंकि रद्दीकरण मैन्युअल रूप से समन्वित किया जाता है: वेटलिस्ट देखना, मरीजों को फ़ोन करना, उम्मीद करना कि कोई जल्दी आ सके।",
    solution:
      "ClinicSlotHub इस प्रक्रिया को डिजिटल बनाता है: मरीज़ एक शेयर करने योग्य बुकिंग लिंक के माध्यम से वेटलिस्ट में जुड़ते हैं। जब कोई स्लॉट खुलता है, तो प्रैक्टिस कुछ क्लिक में ई-मेल या वैकल्पिक SMS/WhatsApp से उपयुक्त मरीजों को सूचित करती है।",
    whatWorks: "अभी क्या काम करता है:",
    features: [
      "संरचित पेशेंट प्रोफाइल के साथ डिजिटल वेटलिस्ट",
      "प्रत्येक प्रैक्टिस को अपना सार्वजनिक बुकिंग लिंक – वेबसाइट, ई-मेल या QR कोड से शेयर करें (पेशेंट को अकाउंट की जरूरत नहीं)",
      "लाइव ई-मेल नोटिफिकेशन (Resend के माध्यम से)",
      "वैकल्पिक SMS/WhatsApp नोटिफिकेशन (Twilio के माध्यम से)",
      "10 भाषाओं में बहुभाषी इंटरफेस",
      "गोपनीयता-सचेत डिज़ाइन – ट्रैकिंग नहीं, DPA अनुरोध पर",
      "14 दिन का मुफ्त ट्रायल, कोई क्रेडिट कार्ड नहीं",
    ],
    statusTitle: "वर्तमान स्थिति",
    status:
      "सार्वजनिक सॉफ्ट लॉन्च। अभी तक कोई भुगतान करने वाला ग्राहक नहीं। एक काम करने वाला लाइव प्रोडक्ट जिसे अब असली प्रैक्टिस टेस्ट और बेहतर कर रही हैं।",
    trialNote: "रजिस्ट्रेशन पूरी तरह से सेल्फ-सर्विस है — कोई आमंत्रण नहीं चाहिए।",
    legalNote:
      "नोट: वास्तविक पेशेंट डेटा के साथ उत्पादक उपयोग से पहले स्थानीय कानूनी और डेटा सुरक्षा आवश्यकताओं की समीक्षा करें।",
    ctaTrial: "मुफ्त आज़माएँ",
    ctaContact: "संपर्क करें",
    ctaBook: "बुकिंग फ़ॉर्म टेस्ट करें",
    ogTitle: "ClinicSlotHub – वैश्विक सॉफ्ट लॉन्च",
    ogDesc: "क्लिनिक के लिए बहुभाषी अपॉइंटमेंट और वेटलिस्ट SaaS – अब उपलब्ध। 14 दिन मुफ्त।",
  },
  ar: {
    dir: "rtl",
    badge: "الإطلاق العالمي التجريبي العام · يونيو 2026",
    headline: "ClinicSlotHub – متاح الآن في جميع أنحاء العالم",
    subline:
      "منصة دولية لإدارة طلبات المواعيد وقوائم الانتظار للعيادات والمراكز الطبية ومراكز العلاج ومقدمي خدمات الرعاية الصحية.",
    problem:
      "كثير من العيادات تفقد وقتاً يومياً لأن الإلغاءات تُنسَّق يدوياً: مراجعة قائمة الانتظار، الاتصال بالمرضى، الأمل في أن يكون أحدهم متاحاً بإشعار قصير.",
    solution:
      "ClinicSlotHub يُرقمن هذه العملية: يُسجّل المرضى أنفسهم عبر رابط حجز قابل للمشاركة. عند توفر موعد، تُخطر العيادة المرضى المناسبين عبر البريد الإلكتروني أو SMS/WhatsApp الاختياري.",
    whatWorks: "ما يعمل الآن:",
    features: [
      "قائمة انتظار رقمية مع ملفات تعريف مرضى منظمة",
      "رابط حجز خاص لكل عيادة – قابل للمشاركة عبر الموقع أو البريد الإلكتروني أو رمز QR (بدون حساب للمريض)",
      "إشعارات بريد إلكتروني فورية (عبر Resend)",
      "إشعارات SMS/WhatsApp اختيارية (عبر Twilio)",
      "واجهة متعددة اللغات بـ 10 لغات",
      "تصميم يراعي الخصوصية – بدون تتبع، DPA عند الطلب",
      "تجربة مجانية 14 يوماً، بدون بطاقة ائتمان",
    ],
    statusTitle: "الحالة الراهنة",
    status:
      "إطلاق عام تجريبي. لا عملاء يدفعون حتى الآن. منتج حي يعمل، يتم اختباره وتحسينه من قِبل عيادات حقيقية.",
    trialNote: "التسجيل ذاتي تماماً — لا تتطلب دعوة.",
    legalNote:
      "ملاحظة: يجب مراجعة المتطلبات القانونية ومتطلبات حماية البيانات المحلية قبل الاستخدام الإنتاجي مع بيانات المرضى الحقيقية.",
    ctaTrial: "جرّب مجاناً",
    ctaContact: "تواصل معنا",
    ctaBook: "اختبر نموذج الحجز",
    ogTitle: "ClinicSlotHub – الإطلاق العالمي",
    ogDesc: "منصة SaaS متعددة اللغات لإدارة المواعيد والانتظار في العيادات – متاحة الآن. تجربة مجانية 14 يوماً.",
  },
  bn: {
    dir: "ltr",
    badge: "বৈশ্বিক পাবলিক সফট লঞ্চ · জুন ২০২৬",
    headline: "ClinicSlotHub – এখন বিশ্বব্যাপী উপলব্ধ",
    subline:
      "ক্লিনিক, মেডিকেল প্র্যাকটিস, থেরাপি সেন্টার এবং স্বাস্থ্যসেবা প্রদানকারীদের জন্য একটি আন্তর্জাতিক অ্যাপয়েন্টমেন্ট ও ওয়েটলিস্ট ম্যানেজমেন্ট প্ল্যাটফর্ম।",
    problem:
      "অনেক প্র্যাকটিস প্রতিদিন সময় হারায় কারণ বাতিল অ্যাপয়েন্টমেন্ট ম্যানুয়ালি সমন্বয় করা হয়: ওয়েটলিস্ট দেখা, রোগীদের ফোন করা, আশা করা যে কেউ শীঘ্রই আসতে পারবেন।",
    solution:
      "ClinicSlotHub এই প্রক্রিয়াটি ডিজিটালাইজ করে: রোগীরা একটি শেয়ারযোগ্য বুকিং লিংকের মাধ্যমে ওয়েটলিস্টে যোগ দেন। স্লট খালি হলে, প্র্যাকটিস কয়েক ক্লিকে ইমেইল বা ঐচ্ছিক SMS/WhatsApp-এর মাধ্যমে উপযুক্ত রোগীদের জানাতে পারে।",
    whatWorks: "এখন যা কাজ করছে:",
    features: [
      "গঠনমূলক পেশেন্ট প্রোফাইল সহ ডিজিটাল ওয়েটলিস্ট",
      "প্রতিটি প্র্যাকটিসের নিজস্ব পাবলিক বুকিং লিংক – ওয়েবসাইট, ইমেইল বা QR কোডে শেয়ার করুন (কোনো অ্যাকাউন্ট দরকার নেই)",
      "লাইভ ইমেইল নোটিফিকেশন (Resend-এর মাধ্যমে)",
      "ঐচ্ছিক SMS/WhatsApp নোটিফিকেশন (Twilio-র মাধ্যমে)",
      "১০টি ভাষায় বহুভাষিক ইন্টারফেস",
      "গোপনীয়তা-সচেতন ডিজাইন – ট্র্যাকিং নেই, DPA অনুরোধে",
      "১৪ দিনের বিনামূল্যে ট্রায়াল, কোনো ক্রেডিট কার্ড নেই",
    ],
    statusTitle: "বর্তমান অবস্থা",
    status:
      "পাবলিক সফট লঞ্চ। এখনও কোনো পেইং কাস্টমার নেই। একটি কার্যকর লাইভ পণ্য যা এখন বাস্তব প্র্যাকটিস দ্বারা পরীক্ষা এবং উন্নত করা হচ্ছে।",
    trialNote: "রেজিস্ট্রেশন সম্পূর্ণ সেলফ-সার্ভিস — কোনো আমন্ত্রণ প্রয়োজন নেই।",
    legalNote:
      "নোট: প্রকৃত রোগীর ডেটা দিয়ে উৎপাদনশীল ব্যবহারের আগে স্থানীয় আইনি ও ডেটা সুরক্ষা প্রয়োজনীয়তা পর্যালোচনা করুন।",
    ctaTrial: "বিনামূল্যে চেষ্টা করুন",
    ctaContact: "যোগাযোগ করুন",
    ctaBook: "বুকিং ফর্ম পরীক্ষা করুন",
    ogTitle: "ClinicSlotHub – বৈশ্বিক সফট লঞ্চ",
    ogDesc: "ক্লিনিকের জন্য বহুভাষিক অ্যাপয়েন্টমেন্ট ও ওয়েটলিস্ট SaaS – এখন উপলব্ধ। ১৪ দিন বিনামূল্যে।",
  },
  ru: {
    dir: "ltr",
    badge: "Глобальный публичный мягкий запуск · Июнь 2026",
    headline: "ClinicSlotHub – теперь доступен по всему миру",
    subline:
      "Международная платформа для управления запросами на приём и листами ожидания для клиник, медицинских кабинетов, терапевтических центров и поставщиков медицинских услуг.",
    problem:
      "Многие практики ежедневно теряют время, потому что отмены координируются вручную: просматривать лист ожидания, звонить пациентам, надеяться, что кто-то придёт в короткие сроки.",
    solution:
      "ClinicSlotHub оцифровывает этот процесс: пациенты записываются сами через ссылку для бронирования. Когда появляется свободный слот, практика уведомляет подходящих пациентов по электронной почте или через SMS/WhatsApp — за несколько кликов.",
    whatWorks: "Что работает прямо сейчас:",
    features: [
      "Цифровой лист ожидания со структурированными профилями пациентов",
      "Собственная публичная ссылка для записи на каждую практику – делитесь через сайт, e-mail или QR-код (без аккаунта пациента)",
      "Уведомления по электронной почте в реальном времени (через Resend)",
      "Опциональные SMS/WhatsApp уведомления (через Twilio)",
      "Многоязычный интерфейс на 10 языках",
      "Дизайн с соблюдением конфиденциальности – без отслеживания, DPA по запросу",
      "14-дневный бесплатный пробный период, без кредитной карты",
    ],
    statusTitle: "Текущий статус",
    status:
      "Публичный мягкий запуск. Платных клиентов пока нет. Работающий живой продукт, который тестируется и улучшается реальными практиками.",
    trialNote: "Регистрация полностью самостоятельная — приглашение не требуется.",
    legalNote:
      "Примечание: местные правовые требования и требования по защите данных необходимо проверить перед продуктивным использованием с реальными данными пациентов.",
    ctaTrial: "Попробовать бесплатно",
    ctaContact: "Связаться с нами",
    ctaBook: "Протестировать форму записи",
    ogTitle: "ClinicSlotHub – Глобальный мягкий запуск",
    ogDesc:
      "Многоязычный SaaS для управления записями и листами ожидания — теперь доступен. 14 дней бесплатно.",
  },
};

function getContent(locale: string): LaunchContent {
  return CONTENT[locale] ?? CONTENT["en"];
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale);
  return {
    title: `${c.ogTitle} – ClinicSlotHub`,
    description: c.ogDesc,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/launch`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/launch`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title: c.ogTitle,
      description: c.ogDesc,
      url: `${CANONICAL_URL}/${locale}/launch`,
      siteName: "ClinicSlotHub",
      type: "website",
      images: [
        {
          url: `${CANONICAL_URL}/images/launch/01-home-de-hero.png`,
          width: 1440,
          height: 1000,
          alt: "ClinicSlotHub Dashboard",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: c.ogTitle,
      description: c.ogDesc,
    },
  };
}

// ─── Lokalisierte 3-Schritt-Erklärung ────────────────────────────────────────

type HowItWorks = {
  steps: Array<{ title: string; desc: string }>;
};

const HOW_IT_WORKS: Record<string, HowItWorks> = {
  de: {
    steps: [
      {
        title: "Praxis erhält eigenen Buchungslink",
        desc: "Nach der Registrierung bekommt jede Praxis einen einzigartigen Link, den sie auf ihrer Website, per E-Mail oder als QR-Code teilen kann.",
      },
      {
        title: "Patienten stellen Anfragen – ohne Login",
        desc: "Patienten öffnen den Link, füllen das Formular aus und senden ihre Anfrage. Kein Konto, kein Passwort – null Aufwand.",
      },
      {
        title: "Praxis verwaltet alles im Dashboard",
        desc: "Anfragen, Warteliste und Benachrichtigungen – alles an einem Ort. Die Praxis bestätigt oder lehnt Termine manuell ab.",
      },
    ],
  },
  en: {
    steps: [
      {
        title: "Practice gets a booking link",
        desc: "After registration each practice gets a unique booking link to share on their website, by email or as a QR code.",
      },
      {
        title: "Patients submit requests — no login",
        desc: "Patients open the link, fill in the form and submit. No account, no password — zero friction.",
      },
      {
        title: "Practice manages everything in the dashboard",
        desc: "Requests, waitlist and notifications — all in one place. The practice confirms or declines appointments manually.",
      },
    ],
  },
};

function getHowItWorks(locale: string): HowItWorks {
  return HOW_IT_WORKS[locale] ?? HOW_IT_WORKS["en"];
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function LaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = getContent(locale);
  const hiw = getHowItWorks(locale);
  const stepIcons = [LinkIcon, UserCheck, LayoutDashboard];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12" dir={c.dir}>
      {/* Language switcher */}
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/launch" />
      </div>

      {/* Badge */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        {c.badge}
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
        {c.headline}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {c.subline}
      </p>

      {/* CTA buttons — above fold */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/auth/register" className="btn-brand">
          {c.ctaTrial}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
        <Link
          href={`/${locale}/kontakt`}
          className="btn-outline-brand"
        >
          <Mail className="mr-1.5 h-4 w-4" />
          {c.ctaContact}
        </Link>
      </div>

      {/* Hero screenshot */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-700">
        <Image
          src="/images/launch/01-home-de-hero.png"
          alt="ClinicSlotHub Dashboard"
          width={1440}
          height={1000}
          className="w-full"
          priority
        />
      </div>

      {/* 3-step "how it works" */}
      <section className="mt-14">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Wie es funktioniert
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {hiw.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                key={i}
                className="relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Step number */}
                <span className="absolute right-4 top-4 text-xs font-bold text-slate-300 dark:text-slate-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: "var(--gradient-brand)" }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mt-14 space-y-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {c.problem}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 dark:border-blue-900/30 dark:bg-blue-950/10">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {c.solution}
          </p>
        </div>
      </section>

      {/* What works now */}
      <section className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/30">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {c.whatWorks}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {c.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Screenshot pair */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
          <Image
            src="/images/launch/02-booking-form-de.png"
            alt="Booking form"
            width={1440}
            height={1100}
            className="w-full"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
          <Image
            src="/images/launch/06-mobile-home-de.png"
            alt="Mobile view"
            width={390}
            height={844}
            className="w-full"
          />
        </div>
      </div>

      {/* Status */}
      <section className="mt-10 surface-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {c.statusTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {c.status}
        </p>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{c.trialNote}</p>
      </section>

      {/* Languages */}
      <section className="mt-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Globe className="h-4 w-4 shrink-0 text-blue-500" />
        <span>DE · EN · FR · ES · PT · ZH · HI · AR · BN · RU</span>
      </section>

      {/* Legal note */}
      <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          {c.legalNote}
        </p>
      </div>

      {/* Bottom links */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href={`/${locale}/blog`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → Blog
        </Link>
        <Link
          href={`/${locale}/pricing`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → Pricing
        </Link>
        <Link
          href={`/${locale}/termin-buchen`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → {c.ctaBook}
        </Link>
      </div>
    </main>
  );
}

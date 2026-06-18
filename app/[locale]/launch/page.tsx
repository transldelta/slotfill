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
    badge: "Early Access · Juni 2026",
    headline: "ClinicSlotHub – der mobile Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten",
    subline:
      "Für Kliniken in wachstumsstarken Gesundheitsmärkten, die WhatsApp-, Telefon-, Rezeptions- und mobile Patientenanfragen in einer einfachen Warteliste organisieren möchten.",
    problem:
      "Viele Kliniken verlieren täglich Zeit, weil Anfragen über WhatsApp, Telefon und Rezeption verstreut ankommen und manuell koordiniert werden. Das kostet Personal und führt zu unnötigen Leerterminen.",
    solution:
      "ClinicSlotHub bündelt diesen Prozess: Jede Klinik erhält einen eigenen öffentlichen Anfrage-Link, teilbar via WhatsApp, Website, E-Mail oder QR-Code. Patienten senden ohne Login eine Anfrage; die Klinik sieht diese im Dashboard und prüft sie. WhatsApp-, Telefon- und Rezeptions-Fallback bleiben in der Hand der Klinik – kein automatischer Versand, keine automatische Terminbestätigung.",
    whatWorks: "Was aktuell funktioniert:",
    features: [
      "Eigener öffentlicher Anfrage-Link pro Klinik – teilbar via WhatsApp, Website, E-Mail oder QR-Code",
      "Patienten senden Anfrage ohne Login – kein Konto, kein Aufwand",
      "Anfragen im Dashboard prüfen und beantworten",
      "Einfache digitale Warteliste mit strukturierten Patientenprofilen",
      "WhatsApp-ready ohne API · Telefon- und Rezeptions-Fallback",
      "Mehrsprachige Oberfläche in 10 Sprachen",
      "Early Access – Zugang auf Anfrage",
    ],
    statusTitle: "Aktueller Status",
    status:
      "Early Access für Kliniken in wachstumsstarken Gesundheitsmärkten. Ein funktionierendes Live-Produkt, das jetzt mit echten Kliniken getestet und verbessert wird. Keine Erfolgsversprechen, keine erfundenen Zahlen.",
    trialNote: "Zugang auf Anfrage – wir begleiten die Einrichtung der ersten Test-Klinik.",
    legalNote:
      "Hinweis: Lokale rechtliche und datenschutzrechtliche Anforderungen sollten vor dem produktiven Einsatz mit echten Patientendaten geprüft werden.",
    ctaTrial: "Zugang anfragen",
    ctaContact: "Kontakt aufnehmen",
    ctaBook: "Demo-Anfrage testen",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Mobiler Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten.",
  },
  en: {
    dir: "ltr",
    badge: "Early Access · June 2026",
    headline: "ClinicSlotHub – the mobile request and waitlist desk for clinics in emerging healthcare markets",
    subline:
      "For clinics in emerging healthcare markets that want to organize WhatsApp, phone, reception and mobile patient requests in one simple waitlist.",
    problem:
      "Many clinics lose time every day because requests arrive scattered across WhatsApp, phone and reception and are coordinated manually. This costs staff time and leads to avoidable empty slots.",
    solution:
      "ClinicSlotHub brings this together: each clinic gets its own public request link that can be shared via WhatsApp, a website, by email or as a QR code. Patients submit a request without logging in; the clinic sees the request in the dashboard and reviews it. WhatsApp, phone and reception fallback stay in the clinic's hands — no automatic sending and no automatic appointment confirmation.",
    whatWorks: "What is working right now:",
    features: [
      "Own public request link per clinic – shareable via WhatsApp, website, email or QR code",
      "Patients submit requests without logging in – no account, no friction",
      "Review and respond to requests directly in the dashboard",
      "Simple digital waitlist with structured patient profiles",
      "WhatsApp-ready without API · phone and reception fallback",
      "Multilingual interface in 10 languages",
      "Early access – request access to get started",
    ],
    statusTitle: "Current status",
    status:
      "Early access for clinics in emerging healthcare markets. A working live product that is now being tested and improved with real clinics. No promises of results and no invented numbers.",
    trialNote: "Access on request — we help you set up the first test clinic.",
    legalNote:
      "Note: Local legal and data protection requirements should be reviewed before productive use with real patient data.",
    ctaTrial: "Request access",
    ctaContact: "Get in touch",
    ctaBook: "Try the demo request",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Mobile request and waitlist desk for clinics in emerging healthcare markets.",
  },
  fr: {
    dir: "ltr",
    badge: "Pour les cliniques des marchés de santé émergents",
    headline: "Le bureau mobile de demandes et de liste d'attente pour les cliniques des marchés de santé émergents",
    subline:
      "ClinicSlotHub aide les cliniques des marchés de santé émergents à organiser les demandes des patients par WhatsApp, téléphone, accueil et mobile dans une simple liste d'attente. Sans connexion patient. Prêt pour WhatsApp sans API. Solution de repli par téléphone et accueil. La clinique garde le contrôle.",
    problem:
      "De nombreux cabinets perdent du temps chaque jour parce que les annulations sont gérées manuellement : parcourir la liste d'attente, appeler les patients, espérer qu'un créneau se remplisse. Cela coûte du temps et génère des créneaux vides évitables.",
    solution:
      "ClinicSlotHub digitalise ce processus : les patients s'inscrivent eux-mêmes via un lien de réservation partageable. Quand un créneau se libère, le cabinet notifie les patients correspondants par e-mail ou SMS/WhatsApp optionnel — en quelques clics.",
    whatWorks: "Ce qui fonctionne dès maintenant :",
    features: [
      "Liste d'attente numérique avec profils patients structurés",
      "Lien de réservation propre par cabinet – partageable par site web, e-mail ou QR code (sans compte patient)",
      "Notifications e-mail en temps réel",
      "Notifications SMS/WhatsApp optionnelles",
      "Interface multilingue en 10 langues",
      "Conception respectueuse de la vie privée – pas de tracking, DPA sur demande",
      "14 jours d'essai gratuit, sans carte bancaire",
    ],
    statusTitle: "Statut actuel",
    status:
      "Accès anticipé pour les cliniques des marchés de santé émergents — sans connexion patient.",
    trialNote: "L'inscription est entièrement en libre-service — aucune invitation requise.",
    legalNote:
      "Note : Les exigences légales et de protection des données locales (p. ex. un accord de traitement des données selon le RGPD Art. 28) doivent être vérifiées avant toute utilisation productive avec de vraies données patients.",
    ctaTrial: "Essayer gratuitement",
    ctaContact: "Nous contacter",
    ctaBook: "Tester le formulaire de réservation",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Pour les cliniques des marchés de santé émergents",
  },
  es: {
    dir: "ltr",
    badge: "Para clínicas en mercados de salud emergentes",
    headline: "La central móvil de solicitudes y lista de espera para clínicas en mercados de salud emergentes",
    subline:
      "ClinicSlotHub ayuda a las clínicas en mercados de salud emergentes a organizar las solicitudes de pacientes por WhatsApp, teléfono, recepción y móvil en una lista de espera simple. Sin inicio de sesión del paciente. Listo para WhatsApp sin API. Alternativa por teléfono y recepción. La clínica mantiene el control.",
    problem:
      "Muchos consultorios pierden tiempo cada día porque las cancelaciones se coordinan manualmente: revisar la lista de espera, llamar a los pacientes, esperar que alguien esté disponible con poca anticipación.",
    solution:
      "ClinicSlotHub digitaliza este proceso: los pacientes se añaden a la lista de espera a través de un enlace de reserva compartible. Cuando se libera un espacio, el consultorio notifica a los pacientes adecuados por correo electrónico o SMS/WhatsApp opcional.",
    whatWorks: "Qué funciona ahora mismo:",
    features: [
      "Lista de espera digital con perfiles de pacientes estructurados",
      "Enlace de reserva propio por consultorio – compartible por web, e-mail o código QR (sin cuenta de paciente)",
      "Notificaciones por correo en tiempo real",
      "Notificaciones SMS/WhatsApp opcionales",
      "Interfaz multilingüe en 10 idiomas",
      "Diseño respetuoso con la privacidad – sin seguimiento, DPA disponible",
      "14 días de prueba gratuita, sin tarjeta de crédito",
    ],
    statusTitle: "Estado actual",
    status:
      "Acceso anticipado para clínicas en mercados de salud emergentes — sin inicio de sesión del paciente.",
    trialNote: "El registro es completamente de autoservicio — no se necesita invitación.",
    legalNote:
      "Nota: Los requisitos legales y de protección de datos locales deben revisarse antes del uso productivo con datos reales de pacientes.",
    ctaTrial: "Probar gratis",
    ctaContact: "Contactar",
    ctaBook: "Probar el formulario de reserva",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Para clínicas en mercados de salud emergentes",
  },
  pt: {
    dir: "ltr",
    badge: "Para clínicas em mercados de saúde emergentes",
    headline: "A central móvel de pedidos e lista de espera para clínicas em mercados de saúde emergentes",
    subline:
      "O ClinicSlotHub ajuda clínicas em mercados de saúde emergentes a organizar pedidos de pacientes por WhatsApp, telefone, receção e telemóvel numa lista de espera simples. Sem login de paciente. Pronto para WhatsApp sem API. Alternativa por telefone e receção. A clínica mantém o controlo.",
    problem:
      "Muitos consultórios perdem tempo todos os dias porque os cancelamentos são coordenados manualmente: rever a lista de espera, ligar aos pacientes, esperar que alguém esteja disponível com pouca antecedência.",
    solution:
      "ClinicSlotHub digitaliza este processo: os pacientes inscrevem-se através de um link de reserva partilhável. Quando um slot fica livre, o consultório notifica os pacientes adequados por e-mail ou SMS/WhatsApp opcional.",
    whatWorks: "O que funciona agora:",
    features: [
      "Lista de espera digital com perfis de pacientes estruturados",
      "Link de reserva próprio por consultório – partilhável por site, e-mail ou código QR (sem conta de paciente)",
      "Notificações por e-mail em tempo real",
      "Notificações SMS/WhatsApp opcionais",
      "Interface multilingue em 10 idiomas",
      "Design respeitador da privacidade – sem rastreamento, DPA disponível",
      "14 dias de teste gratuito, sem cartão de crédito",
    ],
    statusTitle: "Estado atual",
    status:
      "Acesso antecipado para clínicas em mercados de saúde emergentes — sem login de paciente.",
    trialNote: "O registo é totalmente self-service — não é necessário convite.",
    legalNote:
      "Nota: Os requisitos legais e de proteção de dados locais devem ser verificados antes da utilização produtiva com dados reais de pacientes.",
    ctaTrial: "Experimentar gratuitamente",
    ctaContact: "Entrar em contacto",
    ctaBook: "Testar o formulário de reserva",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Para clínicas em mercados de saúde emergentes",
  },
  zh: {
    dir: "ltr",
    badge: "面向新兴医疗市场的诊所",
    headline: "面向新兴医疗市场诊所的移动请求与候补名单中心",
    subline: "ClinicSlotHub 帮助新兴医疗市场的诊所，将来自 WhatsApp、电话、前台和手机的患者请求集中到一个简单的候补名单中。无需患者登录。无需 API 即可使用 WhatsApp。电话和前台作为备用方式。诊所始终掌控。",
    problem:
      "许多诊所每天因手动协调取消预约而损失时间：逐一查看候补名单、给患者打电话、希望有人能临时前来。这耗费了员工时间，并导致不必要的空档损失。",
    solution:
      "ClinicSlotHub 将此流程数字化：患者通过可分享的预约链接加入候补名单。当有空档时，诊所只需几次点击即可通过电子邮件（或可选的短信/WhatsApp）通知合适的患者。",
    whatWorks: "当前可用功能：",
    features: [
      "带结构化患者档案的数字候补名单",
      "每家诊所拥有独立的公开预约链接 – 可通过网站、邮件或二维码分享（患者无需注册）",
      "实时电子邮件通知",
      "可选短信/WhatsApp 通知",
      "支持 10 种语言的多语言界面",
      "隐私保护设计 — 无追踪，可按需提供数据处理协议",
      "14 天免费试用，无需信用卡",
    ],
    statusTitle: "当前状态",
    status:
      "面向新兴医疗市场诊所的抢先体验——无需患者登录。",
    trialNote: "注册完全自助服务 — 无需邀请。",
    legalNote: "注意：在正式使用真实患者数据之前，请审查当地适用的法律和数据保护要求。",
    ctaTrial: "免费试用",
    ctaContact: "联系我们",
    ctaBook: "测试预约表单",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc: "面向新兴医疗市场的诊所",
  },
  hi: {
    dir: "ltr",
    badge: "उभरते स्वास्थ्य बाज़ारों के क्लीनिकों के लिए",
    headline: "उभरते स्वास्थ्य बाज़ारों के क्लीनिकों के लिए मोबाइल अनुरोध और प्रतीक्षा-सूची डेस्क",
    subline:
      "ClinicSlotHub उभरते स्वास्थ्य बाज़ारों के क्लीनिकों को WhatsApp, फ़ोन, रिसेप्शन और मोबाइल मरीज़ अनुरोधों को एक सरल प्रतीक्षा-सूची में व्यवस्थित करने में मदद करता है। कोई मरीज़ लॉगिन नहीं। API के बिना WhatsApp-तैयार। फ़ोन और रिसेप्शन फ़ॉलबैक। क्लीनिक नियंत्रण में रहता है।",
    problem:
      "कई प्रैक्टिस रोज़ाना समय खोती हैं क्योंकि रद्दीकरण मैन्युअल रूप से समन्वित किया जाता है: वेटलिस्ट देखना, मरीजों को फ़ोन करना, उम्मीद करना कि कोई जल्दी आ सके।",
    solution:
      "ClinicSlotHub इस प्रक्रिया को डिजिटल बनाता है: मरीज़ एक शेयर करने योग्य बुकिंग लिंक के माध्यम से वेटलिस्ट में जुड़ते हैं। जब कोई स्लॉट खुलता है, तो प्रैक्टिस कुछ क्लिक में ई-मेल या वैकल्पिक SMS/WhatsApp से उपयुक्त मरीजों को सूचित करती है।",
    whatWorks: "अभी क्या काम करता है:",
    features: [
      "संरचित पेशेंट प्रोफाइल के साथ डिजिटल वेटलिस्ट",
      "प्रत्येक प्रैक्टिस को अपना सार्वजनिक बुकिंग लिंक – वेबसाइट, ई-मेल या QR कोड से शेयर करें (पेशेंट को अकाउंट की जरूरत नहीं)",
      "लाइव ई-मेल नोटिफिकेशन",
      "वैकल्पिक SMS/WhatsApp नोटिफिकेशन",
      "10 भाषाओं में बहुभाषी इंटरफेस",
      "गोपनीयता-सचेत डिज़ाइन – ट्रैकिंग नहीं, DPA अनुरोध पर",
      "14 दिन का मुफ्त ट्रायल, कोई क्रेडिट कार्ड नहीं",
    ],
    statusTitle: "वर्तमान स्थिति",
    status:
      "उभरते स्वास्थ्य बाज़ारों के क्लीनिकों के लिए अर्ली एक्सेस — कोई मरीज़ लॉगिन आवश्यक नहीं।",
    trialNote: "रजिस्ट्रेशन पूरी तरह से सेल्फ-सर्विस है — कोई आमंत्रण नहीं चाहिए।",
    legalNote:
      "नोट: वास्तविक पेशेंट डेटा के साथ उत्पादक उपयोग से पहले स्थानीय कानूनी और डेटा सुरक्षा आवश्यकताओं की समीक्षा करें।",
    ctaTrial: "मुफ्त आज़माएँ",
    ctaContact: "संपर्क करें",
    ctaBook: "बुकिंग फ़ॉर्म टेस्ट करें",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc: "उभरते स्वास्थ्य बाज़ारों के क्लीनिकों के लिए",
  },
  ar: {
    dir: "rtl",
    badge: "للعيادات في أسواق الرعاية الصحية الناشئة",
    headline: "مكتب الطلبات وقائمة الانتظار عبر الهاتف للعيادات في أسواق الرعاية الصحية الناشئة",
    subline:
      "يساعد ClinicSlotHub العيادات في أسواق الرعاية الصحية الناشئة على تنظيم طلبات المرضى عبر واتساب والهاتف والاستقبال والجوال في قائمة انتظار بسيطة واحدة. بدون تسجيل دخول للمريض. جاهز لواتساب بدون واجهة برمجية (API). بديل عبر الهاتف والاستقبال. العيادة تبقى المتحكمة.",
    problem:
      "كثير من العيادات تفقد وقتاً يومياً لأن الإلغاءات تُنسَّق يدوياً: مراجعة قائمة الانتظار، الاتصال بالمرضى، الأمل في أن يكون أحدهم متاحاً بإشعار قصير.",
    solution:
      "ClinicSlotHub يُرقمن هذه العملية: يُسجّل المرضى أنفسهم عبر رابط حجز قابل للمشاركة. عند توفر موعد، تُخطر العيادة المرضى المناسبين عبر البريد الإلكتروني أو SMS/WhatsApp الاختياري.",
    whatWorks: "ما يعمل الآن:",
    features: [
      "قائمة انتظار رقمية مع ملفات تعريف مرضى منظمة",
      "رابط حجز خاص لكل عيادة – قابل للمشاركة عبر الموقع أو البريد الإلكتروني أو رمز QR (بدون حساب للمريض)",
      "إشعارات بريد إلكتروني فورية",
      "إشعارات SMS/WhatsApp اختيارية",
      "واجهة متعددة اللغات بـ 10 لغات",
      "تصميم يراعي الخصوصية – بدون تتبع، DPA عند الطلب",
      "تجربة مجانية 14 يوماً، بدون بطاقة ائتمان",
    ],
    statusTitle: "الحالة الراهنة",
    status:
      "وصول مبكر للعيادات في أسواق الرعاية الصحية الناشئة — بدون تسجيل دخول للمريض.",
    trialNote: "التسجيل ذاتي تماماً — لا تتطلب دعوة.",
    legalNote:
      "ملاحظة: يجب مراجعة المتطلبات القانونية ومتطلبات حماية البيانات المحلية قبل الاستخدام الإنتاجي مع بيانات المرضى الحقيقية.",
    ctaTrial: "جرّب مجاناً",
    ctaContact: "تواصل معنا",
    ctaBook: "اختبر نموذج الحجز",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc: "للعيادات في أسواق الرعاية الصحية الناشئة",
  },
  bn: {
    dir: "ltr",
    badge: "উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোর জন্য",
    headline: "উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোর জন্য মোবাইল অনুরোধ ও অপেক্ষমাণ-তালিকা ডেস্ক",
    subline:
      "ClinicSlotHub উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোকে WhatsApp, ফোন, রিসেপশন ও মোবাইল রোগী অনুরোধ একটি সরল অপেক্ষমাণ-তালিকায় সংগঠিত করতে সাহায্য করে। কোনো রোগী লগইন নেই। API ছাড়াই WhatsApp-প্রস্তুত। ফোন ও রিসেপশন ফলব্যাক। ক্লিনিক নিয়ন্ত্রণে থাকে।",
    problem:
      "অনেক প্র্যাকটিস প্রতিদিন সময় হারায় কারণ বাতিল অ্যাপয়েন্টমেন্ট ম্যানুয়ালি সমন্বয় করা হয়: ওয়েটলিস্ট দেখা, রোগীদের ফোন করা, আশা করা যে কেউ শীঘ্রই আসতে পারবেন।",
    solution:
      "ClinicSlotHub এই প্রক্রিয়াটি ডিজিটালাইজ করে: রোগীরা একটি শেয়ারযোগ্য বুকিং লিংকের মাধ্যমে ওয়েটলিস্টে যোগ দেন। স্লট খালি হলে, প্র্যাকটিস কয়েক ক্লিকে ইমেইল বা ঐচ্ছিক SMS/WhatsApp-এর মাধ্যমে উপযুক্ত রোগীদের জানাতে পারে।",
    whatWorks: "এখন যা কাজ করছে:",
    features: [
      "গঠনমূলক পেশেন্ট প্রোফাইল সহ ডিজিটাল ওয়েটলিস্ট",
      "প্রতিটি প্র্যাকটিসের নিজস্ব পাবলিক বুকিং লিংক – ওয়েবসাইট, ইমেইল বা QR কোডে শেয়ার করুন (কোনো অ্যাকাউন্ট দরকার নেই)",
      "লাইভ ইমেইল নোটিফিকেশন",
      "ঐচ্ছিক SMS/WhatsApp নোটিফিকেশন",
      "১০টি ভাষায় বহুভাষিক ইন্টারফেস",
      "গোপনীয়তা-সচেতন ডিজাইন – ট্র্যাকিং নেই, DPA অনুরোধে",
      "১৪ দিনের বিনামূল্যে ট্রায়াল, কোনো ক্রেডিট কার্ড নেই",
    ],
    statusTitle: "বর্তমান অবস্থা",
    status:
      "উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোর জন্য আর্লি অ্যাক্সেস — কোনো রোগী লগইন প্রয়োজন নেই।",
    trialNote: "রেজিস্ট্রেশন সম্পূর্ণ সেলফ-সার্ভিস — কোনো আমন্ত্রণ প্রয়োজন নেই।",
    legalNote:
      "নোট: প্রকৃত রোগীর ডেটা দিয়ে উৎপাদনশীল ব্যবহারের আগে স্থানীয় আইনি ও ডেটা সুরক্ষা প্রয়োজনীয়তা পর্যালোচনা করুন।",
    ctaTrial: "বিনামূল্যে চেষ্টা করুন",
    ctaContact: "যোগাযোগ করুন",
    ctaBook: "বুকিং ফর্ম পরীক্ষা করুন",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc: "উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোর জন্য",
  },
  ru: {
    dir: "ltr",
    badge: "Для клиник на развивающихся рынках здравоохранения",
    headline: "Мобильный центр заявок и листа ожидания для клиник на развивающихся рынках здравоохранения",
    subline:
      "ClinicSlotHub помогает клиникам на развивающихся рынках здравоохранения собирать заявки пациентов из WhatsApp, по телефону, на ресепшене и с мобильных в одном простом листе ожидания. Без входа для пациента. Готово для WhatsApp без API. Резервные каналы — телефон и ресепшен. Клиника сохраняет контроль.",
    problem:
      "Многие практики ежедневно теряют время, потому что отмены координируются вручную: просматривать лист ожидания, звонить пациентам, надеяться, что кто-то придёт в короткие сроки.",
    solution:
      "ClinicSlotHub оцифровывает этот процесс: пациенты записываются сами через ссылку для бронирования. Когда появляется свободный слот, практика уведомляет подходящих пациентов по электронной почте или через SMS/WhatsApp — за несколько кликов.",
    whatWorks: "Что работает прямо сейчас:",
    features: [
      "Цифровой лист ожидания со структурированными профилями пациентов",
      "Собственная публичная ссылка для записи на каждую практику – делитесь через сайт, e-mail или QR-код (без аккаунта пациента)",
      "Уведомления по электронной почте в реальном времени",
      "Опциональные SMS/WhatsApp уведомления",
      "Многоязычный интерфейс на 10 языках",
      "Дизайн с соблюдением конфиденциальности – без отслеживания, DPA по запросу",
      "14-дневный бесплатный пробный период, без кредитной карты",
    ],
    statusTitle: "Текущий статус",
    status:
      "Ранний доступ для клиник на развивающихся рынках здравоохранения — без входа для пациента.",
    trialNote: "Регистрация полностью самостоятельная — приглашение не требуется.",
    legalNote:
      "Примечание: местные правовые требования и требования по защите данных необходимо проверить перед продуктивным использованием с реальными данными пациентов.",
    ctaTrial: "Попробовать бесплатно",
    ctaContact: "Связаться с нами",
    ctaBook: "Протестировать форму записи",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Для клиник на развивающихся рынках здравоохранения",
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50/35 to-white dark:from-blue-950/10 dark:to-transparent">
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
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
        {c.headline}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {c.subline}
      </p>

      {/* CTA buttons — above fold */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
    </div>
  );
}

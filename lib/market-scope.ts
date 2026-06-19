/**
 * Market-Scope-Hinweise (räumlicher Leistungsbereich).
 *
 * ClinicSlotHub wird derzeit nur für ausgewählte internationale Märkte geprüft und
 * bereitgestellt. Hochregulierte westliche Gesundheitsmärkte (EU/EWR/Europa,
 * USA, Kanada, UK, Australien, Neuseeland) sind derzeit nicht Zielmarkt.
 *
 * WICHTIG: Diese Texte sind reine Hinweis-/Disclaimer-Texte. Sie behaupten
 * KEINE Compliance-Garantie und schließen gesetzliche Pflichten NICHT automatisch
 * aus. Vor einem echten Betrieb mit personenbezogenen Patientendaten ist eine
 * anwaltliche Prüfung erforderlich. Kein Geoblocking, keine Länder-Erkennung.
 *
 * Öffentliche Produktsprachen: EN/DE/FR/ES/PT (EN ist Fallback).
 */

export interface MarketScopeText {
  agbTitle: string;
  agbBody: string[];
  privacyTitle: string;
  privacyBody: string;
  privacyNotice: string;
  imprintTitle: string;
  imprintBody: string;
  bookingNotice: string;
  footer: string;
}

const EN: MarketScopeText = {
  agbTitle: "Territorial scope and excluded markets",
  agbBody: [
    "ClinicSlotHub is currently not intended for users, patients, clinics, practices or healthcare providers located in the European Union, the European Economic Area, Europe, the United States, Canada, the United Kingdom, Australia, New Zealand or other highly regulated western healthcare markets.",
    "Requests, registrations or use from these countries or regions may be rejected or not processed. ClinicSlotHub is currently reviewed and provided only for selected international markets. Availability depends on the relevant country, local legal requirements, technical feasibility and prior internal approval.",
    "ClinicSlotHub is not a medical advice service, emergency service or medical record system. Appointments and appointment requests are reviewed and confirmed by the relevant practice or clinic.",
  ],
  privacyTitle: "Notice on territorial scope",
  privacyBody:
    "ClinicSlotHub is currently not directed at persons or organizations in the EU, EEA, Europe, the United States, Canada, the United Kingdom, Australia or New Zealand. Requests from unsupported jurisdictions may be rejected. If personal data is nevertheless submitted, it will be processed only within the scope of the existing privacy information and technical capabilities.",
  privacyNotice:
    "Important notice: This notice does not guarantee that legal data protection or compliance obligations are automatically excluded. Legal review is required before any real operation involving personal patient data.",
  imprintTitle: "Service availability notice",
  imprintBody:
    'ClinicSlotHub is currently not offered to users, clinics, practices or patients in the EU, EEA, Europe, the United States, Canada, the United Kingdom, Australia or New Zealand. Further details are provided in the "Territorial scope" section of the Terms.',
  bookingNotice:
    "Notice: ClinicSlotHub is currently available only for selected markets. Requests from unsupported jurisdictions may be rejected.",
  footer: "Availability only in selected markets. Not a medical advice or emergency service.",
};

const DE: MarketScopeText = {
  agbTitle: "Räumlicher Leistungsbereich und ausgeschlossene Märkte",
  agbBody: [
    "ClinicSlotHub richtet sich derzeit nicht an Nutzer, Patienten, Praxen, Kliniken oder sonstige Gesundheitsanbieter mit Sitz oder gewöhnlichem Aufenthalt in der Europäischen Union, im Europäischen Wirtschaftsraum, in Europa, den USA, Kanada, dem Vereinigten Königreich, Australien, Neuseeland oder sonstigen hochregulierten westlichen Gesundheitsmärkten.",
    "Die Nutzung, Registrierung oder Anfrage aus diesen Ländern oder Regionen kann abgelehnt oder nicht weiterbearbeitet werden. ClinicSlotHub wird derzeit nur für ausgewählte internationale Märkte geprüft und bereitgestellt. Die Verfügbarkeit hängt vom jeweiligen Land, der lokalen Rechtslage, der technischen Umsetzbarkeit und einer vorherigen internen Freigabe ab.",
    "ClinicSlotHub ist kein medizinischer Beratungsdienst, kein Notfalldienst und kein System zur Speicherung medizinischer Patientenakten. Termine oder Terminanfragen werden durch die jeweilige Praxis oder Klinik geprüft und bestätigt.",
  ],
  privacyTitle: "Hinweis zum räumlichen Anwendungsbereich",
  privacyBody:
    "ClinicSlotHub richtet sich derzeit nicht an Personen oder Einrichtungen in der EU, im EWR, Europa, den USA, Kanada, dem Vereinigten Königreich, Australien oder Neuseeland. Anfragen aus nicht unterstützten Ländern können abgelehnt werden. Soweit personenbezogene Daten dennoch übermittelt werden, werden diese nur im Rahmen der bestehenden Datenschutzinformationen und der technischen Möglichkeiten verarbeitet.",
  privacyNotice:
    "Wichtiger Hinweis: Dieser Hinweis stellt keine Garantie dar, dass gesetzliche Datenschutz- oder Compliance-Pflichten automatisch ausgeschlossen sind. Vor einem echten Betrieb mit personenbezogenen Patientendaten ist eine rechtliche Prüfung erforderlich.",
  imprintTitle: "Hinweis zum Leistungsangebot",
  imprintBody:
    "ClinicSlotHub richtet sich derzeit nicht als Angebot an Nutzer, Praxen, Kliniken oder Patienten in der EU, im EWR, Europa, den USA, Kanada, dem Vereinigten Königreich, Australien oder Neuseeland. Weitere Einzelheiten enthält der Abschnitt „Räumlicher Leistungsbereich“ in den AGB.",
  bookingNotice:
    "Hinweis: ClinicSlotHub ist derzeit nur für ausgewählte Märkte verfügbar. Anfragen aus nicht unterstützten Ländern können abgelehnt werden.",
  footer: "Verfügbarkeit nur in ausgewählten Märkten. Kein medizinischer Beratungs- oder Notfalldienst.",
};

const FR: MarketScopeText = {
  agbTitle: "Champ d'application territorial et marchés exclus",
  agbBody: [
    "ClinicSlotHub ne s'adresse actuellement pas aux utilisateurs, patients, cliniques, cabinets ou prestataires de santé situés dans l'Union européenne, l'Espace économique européen, l'Europe, les États-Unis, le Canada, le Royaume-Uni, l'Australie, la Nouvelle-Zélande ou d'autres marchés de santé occidentaux fortement réglementés.",
    "Les demandes, inscriptions ou utilisations provenant de ces pays ou régions peuvent être refusées ou non traitées. ClinicSlotHub est actuellement examiné et proposé uniquement pour des marchés internationaux sélectionnés. La disponibilité dépend du pays concerné, des exigences légales locales, de la faisabilité technique et d'une autorisation interne préalable.",
    "ClinicSlotHub n'est pas un service de conseil médical, un service d'urgence ni un système de dossiers médicaux. Les rendez-vous et les demandes de rendez-vous sont examinés et confirmés par le cabinet ou la clinique concernés.",
  ],
  privacyTitle: "Avis sur le champ d'application territorial",
  privacyBody:
    "ClinicSlotHub ne s'adresse actuellement pas aux personnes ou organisations situées dans l'UE, l'EEE, l'Europe, les États-Unis, le Canada, le Royaume-Uni, l'Australie ou la Nouvelle-Zélande. Les demandes provenant de juridictions non prises en charge peuvent être refusées. Si des données personnelles sont néanmoins transmises, elles ne sont traitées que dans le cadre des informations de confidentialité existantes et des possibilités techniques.",
  privacyNotice:
    "Avis important : le présent avis ne garantit pas que les obligations légales en matière de protection des données ou de conformité sont automatiquement exclues. Un examen juridique est nécessaire avant toute exploitation réelle de données personnelles de patients.",
  imprintTitle: "Avis de disponibilité du service",
  imprintBody:
    "ClinicSlotHub n'est actuellement pas proposé aux utilisateurs, cliniques, cabinets ou patients dans l'UE, l'EEE, l'Europe, les États-Unis, le Canada, le Royaume-Uni, l'Australie ou la Nouvelle-Zélande. Pour plus de détails, voir la section « Champ d'application territorial » des conditions.",
  bookingNotice:
    "Avis : ClinicSlotHub est actuellement disponible uniquement dans certains marchés sélectionnés. Les demandes provenant de juridictions non prises en charge peuvent être refusées.",
  footer: "Disponibilité uniquement dans certains marchés sélectionnés. Aucun conseil médical ni service d'urgence.",
};

const ES: MarketScopeText = {
  agbTitle: "Ámbito territorial y mercados excluidos",
  agbBody: [
    "ClinicSlotHub actualmente no está dirigido a usuarios, pacientes, clínicas, consultorios o proveedores de salud ubicados en la Unión Europea, el Espacio Económico Europeo, Europa, los Estados Unidos, Canadá, el Reino Unido, Australia, Nueva Zelanda u otros mercados de salud occidentales altamente regulados.",
    "Las solicitudes, registros o usos desde estos países o regiones pueden ser rechazados o no procesados. ClinicSlotHub actualmente se revisa y se ofrece solo para mercados internacionales seleccionados. La disponibilidad depende del país correspondiente, los requisitos legales locales, la viabilidad técnica y una aprobación interna previa.",
    "ClinicSlotHub no es un servicio de asesoramiento médico, un servicio de emergencia ni un sistema de historiales médicos. Las citas y las solicitudes de cita son revisadas y confirmadas por el consultorio o la clínica correspondiente.",
  ],
  privacyTitle: "Aviso sobre el ámbito territorial",
  privacyBody:
    "ClinicSlotHub actualmente no está dirigido a personas u organizaciones en la UE, el EEE, Europa, los Estados Unidos, Canadá, el Reino Unido, Australia o Nueva Zelanda. Las solicitudes desde jurisdicciones no admitidas pueden ser rechazadas. Si aun así se envían datos personales, se procesarán únicamente dentro del alcance de la información de privacidad existente y las posibilidades técnicas.",
  privacyNotice:
    "Aviso importante: este aviso no garantiza que las obligaciones legales de protección de datos o de cumplimiento queden automáticamente excluidas. Se requiere una revisión legal antes de cualquier operación real con datos personales de pacientes.",
  imprintTitle: "Aviso de disponibilidad del servicio",
  imprintBody:
    "ClinicSlotHub actualmente no se ofrece a usuarios, clínicas, consultorios o pacientes en la UE, el EEE, Europa, los Estados Unidos, Canadá, el Reino Unido, Australia o Nueva Zelanda. Más detalles en la sección «Ámbito territorial» de los términos.",
  bookingNotice:
    "Aviso: ClinicSlotHub está disponible actualmente solo en mercados seleccionados. Las solicitudes desde jurisdicciones no admitidas pueden ser rechazadas.",
  footer: "Disponibilidad solo en mercados seleccionados. No es un servicio de asesoramiento médico ni de emergencia.",
};

const PT: MarketScopeText = {
  agbTitle: "Âmbito territorial e mercados excluídos",
  agbBody: [
    "O ClinicSlotHub atualmente não se destina a utilizadores, pacientes, clínicas, consultórios ou prestadores de saúde localizados na União Europeia, no Espaço Económico Europeu, na Europa, nos Estados Unidos, no Canadá, no Reino Unido, na Austrália, na Nova Zelândia ou noutros mercados de saúde ocidentais altamente regulados.",
    "Os pedidos, registos ou utilizações a partir destes países ou regiões podem ser recusados ou não processados. O ClinicSlotHub é atualmente avaliado e disponibilizado apenas para mercados internacionais selecionados. A disponibilidade depende do país em questão, dos requisitos legais locais, da viabilidade técnica e de uma aprovação interna prévia.",
    "O ClinicSlotHub não é um serviço de aconselhamento médico, um serviço de emergência nem um sistema de registos médicos. As consultas e os pedidos de consulta são analisados e confirmados pelo consultório ou clínica em questão.",
  ],
  privacyTitle: "Aviso sobre o âmbito territorial",
  privacyBody:
    "O ClinicSlotHub atualmente não se destina a pessoas ou organizações na UE, no EEE, na Europa, nos Estados Unidos, no Canadá, no Reino Unido, na Austrália ou na Nova Zelândia. Os pedidos de jurisdições não suportadas podem ser recusados. Se ainda assim forem transmitidos dados pessoais, estes serão tratados apenas no âmbito das informações de privacidade existentes e das possibilidades técnicas.",
  privacyNotice:
    "Aviso importante: este aviso não garante que as obrigações legais de proteção de dados ou de conformidade sejam automaticamente excluídas. É necessária uma análise jurídica antes de qualquer operação real com dados pessoais de pacientes.",
  imprintTitle: "Aviso de disponibilidade do serviço",
  imprintBody:
    "O ClinicSlotHub atualmente não é oferecido a utilizadores, clínicas, consultórios ou pacientes na UE, no EEE, na Europa, nos Estados Unidos, no Canadá, no Reino Unido, na Austrália ou na Nova Zelândia. Mais detalhes na secção «Âmbito territorial» dos termos.",
  bookingNotice:
    "Aviso: o ClinicSlotHub está atualmente disponível apenas em mercados selecionados. Pedidos de jurisdições não suportadas podem ser recusados.",
  footer: "Disponibilidade apenas em mercados selecionados. Não é um serviço de aconselhamento médico nem de emergência.",
};

const MAP: Record<string, MarketScopeText> = { en: EN, de: DE, fr: FR, es: ES, pt: PT };

/** Liefert die Market-Scope-Texte für eine Locale (EN als Fallback). */
export function getMarketScope(locale: string): MarketScopeText {
  return MAP[locale] ?? EN;
}

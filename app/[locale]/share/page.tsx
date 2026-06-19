import { redirect } from "next/navigation";

// SECURITY/COPY FREEZE: Alte Kampagnenseite mit veralteter Positionierung und
// Selfservice-Registrierung. Nicht Teil der aktuellen ClinicSlotHub-Positionierung
// – leitet zur Kontaktseite weiter.
export default function RetiredCampaignPage() {
  redirect("/de/kontakt");
}

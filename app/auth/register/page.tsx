import type { Metadata } from "next";
import { redirect } from "next/navigation";

// SECURITY FREEZE (P1): Öffentliche Selfservice-Registrierung ist deaktiviert.
// Praxiszugang wird in der aktuellen Phase nur nach manueller Prüfung vergeben.
// Diese Route leitet daher direkt zur Kontaktseite weiter; es gibt kein
// öffentliches Konto-erstellen-Formular mehr.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  redirect("/en/kontakt");
}

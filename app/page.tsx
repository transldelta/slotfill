import { redirect } from "next/navigation";

/**
 * Die Root-URL / leitet zur lokalisierten Version um.
 * Die Middleware erledigt das normalerweise bereits basierend auf dem Accept-Language-Header.
 * Diese Komponente ist ein Sicherheitsnetz für SSG/SSR-Fälle.
 */
export default function RootPage() {
  redirect("/de");
}

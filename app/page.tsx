import { redirect } from "next/navigation";

/**
 * Die Root-URL / leitet zur Default-Locale (EN) um.
 * Die Middleware erledigt das normalerweise bereits (Default-Locale-Redirect,
 * keine Sprach-Detection). Diese Komponente ist ein Sicherheitsnetz für
 * SSG/SSR-Fälle.
 */
export default function RootPage() {
  redirect("/en");
}

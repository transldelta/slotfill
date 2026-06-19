import type { Metadata } from "next";

// Auth-Bereich (Login, Registrierung, Passwort) ist nicht für Suchmaschinen
// bestimmt. robots.txt blockiert /auth/ bereits; dies setzt zusätzlich
// noindex,nofollow als Absicherung.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}

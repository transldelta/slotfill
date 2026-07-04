import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Default-Locale ist EN – Root-Metadata daher englisch (Anfrage-Sprache);
// das [locale]-Layout liefert weiterhin lokalisierte Metadata pro Sprache.
export const metadata: Metadata = {
  title: "ClinicSlotHub – Request clinic appointments online",
  description: "ClinicSlotHub lets patients request clinic appointments online in a simple, clear flow. Clinics review each request and confirm manually — multilingual and privacy-conscious.",
};

// Setzt das Theme vor dem ersten Paint, um ein Aufblitzen zu vermeiden.
// Interner Key bleibt 'slotfill-theme' für Rückwärtskompatibilität mit bestehenden Nutzern.
const themeScript = `(function(){try{var t=localStorage.getItem('slotfill-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

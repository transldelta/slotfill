import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicSlotHub – Clinic request & waitlist desk",
  description:
    "ClinicSlotHub helps clinics in emerging healthcare markets organize WhatsApp, phone, reception and mobile patient requests in one simple waitlist. No patient login. The clinic stays in control.",
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
    <html lang="de" suppressHydrationWarning>
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

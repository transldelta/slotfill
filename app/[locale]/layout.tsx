import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { locales, type Locale } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "ClinicSlotHub – Appointment & Waitlist Management for Clinics",
  description: "ClinicSlotHub helps clinics, medical offices and healthcare providers manage waitlists and appointment bookings efficiently. Auto-confirm, email notifications, multilingual, GDPR-conscious.",
};

// Setzt das Theme vor dem ersten Paint, um ein Aufblitzen zu vermeiden.
const themeScript = `(function(){try{var t=localStorage.getItem('slotfill-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

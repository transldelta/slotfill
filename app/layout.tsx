import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlotFill",
  description: "Freie Termine automatisch aus der Warteliste füllen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}

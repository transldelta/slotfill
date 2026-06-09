# PraxisFlow – Terminlücken automatisch füllen

PraxisFlow hilft Arztpraxen, kurzfristige Terminausfälle automatisch zu füllen.
Patienten auf der Warteliste können per vorbereitetem Link benachrichtigt werden;
SMS/WhatsApp kann optional über Twilio angebunden werden.
Der erste Klick gewinnt den Termin.

## 🚀 Funktionen

- **Patientenverwaltung**: Patienten mit Name, Telefon und Notizen anlegen.
- **Warteliste**: Patienten auf eine Warteliste setzen.
- **Terminmanagement**: Termine anlegen und Ausfälle markieren.
- **Automatische Benachrichtigung**: Warteliste per Klick informieren (Link wird
  vorbereitet; SMS/WhatsApp optional über Twilio).
- **Öffentliche Buchungsseite**: Patienten buchen den freien Termin selbst.
- **14 Tage kostenlose Testphase**, danach ab 29 €/Monat.
- **Admin-Panel**: Alle Praxen, Einnahmen und Fehler überwachen.
- **E-Mail-Automation**: Willkommens-Mails, Zahlungsbestätigungen.
- **Dark Mode**: Für angenehmes Arbeiten.
- **SEO-optimierte Landingpage** mit Blog.

## 🛠️ Tech-Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Datenbank**: Supabase (PostgreSQL)
- **Zahlungen**: Stripe
- **E-Mails**: Resend
- **Nachrichten**: Twilio (SMS/WhatsApp, optional)
- **Hosting**: Vercel (automatisches Deployment)
- **Sicherheit**: JWT-Auth, RLS, API-Key-Schutz

## 📋 Voraussetzungen

Bevor du startest, brauchst du diese kostenlosen Konten:

1. [GitHub](https://github.com) (kostenlos)
2. [Vercel](https://vercel.com) (Hobby-Plan, kostenlos)
3. [Supabase](https://supabase.com) (Free-Plan, kostenlos)
4. [Stripe](https://stripe.com) (Testmodus, keine monatlichen Kosten)
5. [Resend](https://resend.com) (kostenloser Plan: 3.000 E-Mails/Monat)

Optional:
6. [Twilio](https://twilio.com) (nur für SMS/WhatsApp, kostenlos starten mit Testguthaben)

## 🔧 Lokale Einrichtung

### 1. Repository klonen

```bash
git clone https://github.com/transldelta/slotfill.git
cd slotfill
npm install
```

### 2. Supabase einrichten

1. Supabase-Projekt erstellen (Region: Frankfurt).
2. SQL Editor → die Migrationen aus `supabase/migrations/` **der Reihe nach**
   ausführen (beginnend mit `001_slotfill_schema.sql` bis zur höchsten Nummer).
3. API-Schlüssel aus Settings → API kopieren.

### 3. Umgebungsvariablen setzen

Kopiere die vorhandene Beispieldatei `.env.local.example` nach `.env.local`
und fülle die Werte aus:

```bash
cp .env.local.example .env.local
```

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Testmodus)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (E-Mail)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=PraxisFlow <onboarding@resend.dev>

# Nachrichten (optional, erstmal weglassen)
MESSAGING_PROVIDER=none
TWILIO_WHATSAPP_CONTENT_SID=

# Admin-Zugang
ADMIN_EMAILS=transl.delta@gmail.com

# Cron-Security
CRON_SECRET=ein-langes-geheimes-passwort
```

Eine vollständige Liste aller Variablen findest du in
[`env-documentation.md`](./env-documentation.md).

### 4. Projekt starten

```bash
npm run dev
```

Öffne http://localhost:3000.

### 5. Admin werden

1. Registriere dich mit der E-Mail aus `ADMIN_EMAILS`.
2. Öffne `/admin` – du bist automatisch Admin.
3. Kein manuelles Setzen von Rollen in Supabase nötig.

## ▲ Deployment auf Vercel

1. Repository auf GitHub pushen.
2. Vercel mit GitHub verbinden (vercel.com/new).
3. Repository importieren.
4. Umgebungsvariablen in Vercel setzen (Settings → Environment Variables).
5. Deployen – Vercel deployt automatisch bei jedem Push auf `main`.

Die Cron-Jobs (Trial-Erinnerung, Limit-Reset, Auto-Wartung) sind in
`vercel.json` konfiguriert und laufen automatisch, sobald `CRON_SECRET` gesetzt ist.

## 📄 Projektstruktur

```text
slotfill/
├── app/                    # Next.js App Router Seiten & API-Routen
│   ├── admin/              # Admin-Panel
│   ├── api/                # REST-API
│   ├── auth/               # Login/Registrierung
│   ├── blog/               # Blog-System
│   ├── dashboard/          # Praxis-Dashboard
│   ├── fill/               # Öffentliche Buchungsseite
│   ├── pricing/            # Preis-Seite
│   └── ...                 # Impressum, Datenschutz, AGB
├── components/             # Wiederverwendbare UI-Komponenten
├── lib/                    # Bibliotheken (Supabase, Stripe, Email, Messaging)
├── messages/               # Übersetzungsdateien (de.json)
├── public/                 # Statische Dateien
├── scripts/                # Seed-Scripts & Tests
├── supabase/migrations/    # Datenbank-Migrationen
└── README.md               # Diese Datei
```

## 🔒 Sicherheit

- Alle API-Routen prüfen Authentifizierung.
- `practice_id` wird NUR serverseitig ermittelt.
- Row Level Security (RLS) auf Supabase aktiv.
- Stripe-Webhooks mit Signatur-Prüfung.
- Admin-Zugriff über `ADMIN_EMAILS`, keine manuelle DB-Änderung.
- Keine Secrets im Client.

## 📈 Skalierung

- Vercel: Automatische Skalierung (Serverless).
- Supabase: Kostenloser Plan reicht für ~50 Praxen.
- Resend: 3.000 E-Mails/Monat kostenlos.
- Upgrade-Pfad: Vercel Pro (20 $/M), Supabase Pro (25 $/M).

## 🆘 Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/transldelta/slotfill/issues
- Admin-Panel: `/admin/errors` für Fehlerlogs

## 📜 Lizenz

Dieses Projekt ist privat. Alle Rechte vorbehalten.

---

Erstellt von Brahim Ben Abla für PraxisFlow – weil Praxen keine leeren Termine haben sollten.

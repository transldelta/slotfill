# Umgebungsvariablen – SlotFill

Alle Variablen werden serverseitig genutzt (Ausnahme: `NEXT_PUBLIC_APP_URL`).
Secrets gehören niemals in den Client. Lege sie lokal in `.env.local` und in
Vercel unter **Settings → Environment Variables** an.

| Variable | Erforderlich | Beschreibung | Beispiel |
|----------|--------------|--------------|----------|
| SUPABASE_URL | Ja | Supabase-Projekt-URL | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | Ja | Supabase Anon Key | eyJ... |
| SUPABASE_SERVICE_ROLE_KEY | Ja | Supabase Service Role Key (nur serverseitig) | eyJ... |
| STRIPE_SECRET_KEY | Nein* | Stripe Secret Key (Test/Live) | sk_test_... |
| STRIPE_WEBHOOK_SECRET | Nein* | Stripe Webhook Secret | whsec_... |
| STRIPE_PRICE_STARTER | Nein* | Stripe Price ID – Plan Starter | price_... |
| STRIPE_PRICE_PROFESSIONAL | Nein* | Stripe Price ID – Plan Professional | price_... |
| STRIPE_PRICE_PRAXIS_PLUS | Nein* | Stripe Price ID – Plan Praxis Plus | price_... |
| NEXT_PUBLIC_APP_URL | Ja | Öffentliche App-URL (für Links/Redirects) | http://localhost:3000 |
| RESEND_API_KEY | Nein | Resend API-Key (E-Mail) | re_... |
| RESEND_FROM_EMAIL | Nein | Absender-E-Mail (verifizierte Domain) | SlotFill <onboarding@resend.dev> |
| ADMIN_EMAILS | Ja | Admin-E-Mail-Adressen (kommagetrennt) | transl.delta@gmail.com |
| MESSAGING_PROVIDER | Ja | Nachrichten-Anbieter | none \| twilio_sms \| twilio_whatsapp |
| MESSAGING_DRY_RUN | Nein | Trockentest-Modus (kein echter Versand) | true |
| TWILIO_ACCOUNT_SID | Nein** | Twilio Account SID | AC... |
| TWILIO_AUTH_TOKEN | Nein** | Twilio Auth Token | ... |
| TWILIO_SMS_FROM | Nein** | Twilio SMS-Absendernummer | +49... |
| TWILIO_WHATSAPP_FROM | Nein** | Twilio WhatsApp-Absendernummer | +14155238886 |
| TWILIO_WHATSAPP_CONTENT_SID | Nein** | Content SID der genehmigten WhatsApp-Vorlage | HX... |
| ADMIN_TEST_PHONE | Nein | Test-Telefonnummer für `/admin/messaging-setup` | +49... |
| CRON_SECRET | Ja | Schutz der Cron-Endpunkte (Bearer-Token) | langes-geheimes-passwort |

\* **Stripe**: Erforderlich, sobald Zahlungen/Checkout aktiv genutzt werden.
Ohne diese Werte funktioniert die App weiter, der Checkout meldet aber „nicht konfiguriert".

\*\* **Twilio**: Nur erforderlich, wenn `MESSAGING_PROVIDER=twilio_sms` oder
`twilio_whatsapp`. `TWILIO_WHATSAPP_CONTENT_SID` wird nur für WhatsApp benötigt
(ohne Vorlage wird nicht gesendet). Bei `MESSAGING_PROVIDER=none` alle Twilio-Werte
leer lassen – Benachrichtigungs-Links werden dann nur vorbereitet.

## Hinweise

- **Admin-Zugang**: Wer sich mit einer in `ADMIN_EMAILS` hinterlegten Adresse
  registriert, erhält automatisch Zugriff auf `/admin` – kein manuelles Setzen
  in der Datenbank nötig.
- **Cron-Jobs**: Vercel sendet den Header `Authorization: Bearer <CRON_SECRET>`
  automatisch, wenn `CRON_SECRET` als Umgebungsvariable gesetzt ist.

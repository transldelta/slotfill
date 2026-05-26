# SlotFill – Launch-Checkliste Schritt 13

Rein diagnostischer Launch-Check (Code-Audit + Verifikation). Keine neuen
Produkt-Features. Externe Dienste wurden nur sicher (Code/Testmodus) geprüft –
keine echten Zahlungen, keine echten SMS/WhatsApp.

## Öffentliche Seiten
- [x] / Landingpage geprüft (vorsichtige WhatsApp/SMS-Formulierung, keine toten Links)
- [x] /pricing geprüft
- [x] /blog geprüft (robust bei leerer/fehlender Tabelle → EmptyState)
- [x] /blog/[slug] geprüft (force-dynamic, notFound bei unbekanntem Slug)
- [x] /kontakt geprüft
- [x] /impressum geprüft (als Entwurf markiert, noindex)
- [x] /datenschutz geprüft (Entwurf, noindex)
- [x] /agb geprüft (Entwurf, noindex)
- [x] /auth/login geprüft
- [x] /auth/register geprüft
- [x] /auth/forgot-password vorhanden und geprüft
- [x] /fill/[slug] geprüft (öffentlich; ungültiger/abgelaufener/eingelöster Link sauber)

## Authentifizierung
- [x] Registrierung geprüft (E-Mail-Bestätigung → /auth/callback → Onboarding)
- [x] Login geprüft
- [x] Logout geprüft
- [x] Dashboard-Schutz geprüft (middleware matcher /dashboard/:path*)
- [x] Admin-Schutz mit ADMIN_EMAILS geprüft (requireAdmin: ADMIN_EMAILS ODER is_admin)

## Dashboard
- [x] Übersicht geprüft (echte Statistiken)
- [x] Patienten geprüft (+ /patients/new)
- [x] Warteliste geprüft
- [x] Termine geprüft (+ /appointments/new, Berlin-Zeit)
- [x] Benachrichtigungen geprüft (Status-Labels)
- [x] Abo-Seite geprüft (/dashboard/subscription)
- [x] Einstellungen geprüft (/dashboard/settings)

## Kern-Flow
- [x] Patient anlegen (mit Telefon + whatsapp_opt_in)
- [x] Patient auf Warteliste setzen
- [x] Termin anlegen
- [x] Termin als ausgefallen markieren
- [x] Warteliste benachrichtigen
- [x] Benachrichtigungsstatus korrekt (none → skipped_no_provider, dry_run, no_consent, invalid_phone)
- [x] Fill-Link: Annahme setzt Termin auf "Gefüllt" und entfernt Patient von der Warteliste

## Admin
- [x] /admin geprüft
- [x] /admin/system-check geprüft
- [x] /admin/auto-maintenance geprüft
- [x] /admin/messaging-setup geprüft (nur Ja/Nein, keine Keys)
- [x] /admin/errors geprüft (kein Crash bei leerer/fehlender Tabelle)
- [x] /admin/practices geprüft
- [x] /admin/plans geprüft
- [x] /admin/notifications geprüft
- Audit: alle /api/admin-Routen rufen requireAdmin()/getAdminContext() auf.

## Stripe
- [x] Checkout-Code geprüft (Price aus Plan/ENV, STRIPE_NOT_CONFIGURED/PRICE_MISSING)
- [x] Webhook-Code geprüft (Signaturprüfung, Fehler im E-Mail-Schritt blockieren Webhook nicht)
- [x] Keine echten Zahlungen ausgelöst (nur Code-Audit)
- [x] Keine doppelten Zahlungsbestätigungen (E-Mail nur bei invoice.paid, idempotent über event.id)

## E-Mail
- [x] Resend-Konfiguration geprüft (RESEND_FROM_EMAIL)
- [x] EMAIL/RESEND-Fallback geprüft (kein Crash ohne Key, RESEND_CONFIG_MISSING)
- [x] Willkommens-Mail-Code geprüft (nach Onboarding, nicht blockierend)
- [x] Zahlungsbestätigungs-Code geprüft
- [x] Trial-Reminder-Code geprüft (/api/cron/trial-reminder)

## Messaging
- [x] MESSAGING_PROVIDER=none geprüft (kostenloser Standard, kein Versand)
- [x] MESSAGING_DRY_RUN=true geprüft (Status dry_run, kein echter Versand)
- [x] Keine echte SMS
- [x] Keine echte WhatsApp
- [x] Statuslabels geprüft (de.json statusLabels)
- [x] Twilio optional dokumentiert (README, env-documentation.md)
- Unit-Tests vorhanden: scripts/messaging.test.ts (npm test).

## Cron
- [x] trial-reminder geprüft (Bearer CRON_SECRET → 401 ohne Secret)
- [x] reset-limits geprüft (Bearer CRON_SECRET)
- [x] auto-maintenance geprüft und in vercel.json erhalten
- [x] CRON_SECRET-Prüfung in allen Cron-Routen vorhanden

## SEO & Rechtliches
- [x] robots geprüft (disallow /dashboard/ /admin/ /api/)
- [x] sitemap geprüft (öffentliche Seiten + Blog-Slugs)
- [x] Meta-Tags geprüft (generateMetadata auf öffentlichen Seiten)
- [x] Impressum / Datenschutz / AGB vorhanden (als Entwurf markiert)

## Sicherheit
- [x] Keine Secrets im Client (kein Client importiert lib/supabase Service-Role)
- [x] practice_id serverseitig (getCurrentPractice; nie vom Client)
- [x] Admin-Routen geschützt (requireAdmin)
- [x] API-Routen ohne Auth → 401/403
- [x] Service Role / Stripe / Resend / Twilio nur serverseitig
- [x] Nur NEXT_PUBLIC_APP_URL ist öffentlich

## Health
- [x] /api/health hinzugefügt (minimal): Code HEALTH_OK, services configured/not_configured,
      200 bei erreichbarer DB, 503 sonst – keine Secrets.

## Qualität
- [x] npm run lint grün
- [x] npm run build grün
- [x] npm test grün (scripts/messaging.test.ts)

## Gefundene Fehler und Korrekturen
- Keine echten Fehler in bestehenden Routen gefunden.
- Ergänzt: minimaler /api/health-Endpunkt (war nicht vorhanden, vom Launch-Check vorgesehen).
- Keine fehlenden, aber verlinkten Seiten festgestellt; kein toter Link auf öffentlichen Seiten.

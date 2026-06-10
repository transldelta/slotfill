# ClinicSlotHub – Organic Launch Checklist

Stand: Juni 2026 · Domain: https://clinicslothub.com

---

## Schritt 1 – Google Search Console

1. **Öffne** https://search.google.com/search-console/
2. **Property hinzufügen** → Domain-Property: `clinicslothub.com`
3. **DNS-Verifizierung**: TXT-Record beim Domain-Registrar eintragen
4. **Sitemap einreichen**:
   - Navigation: Sitemaps → Neue Sitemap hinzufügen
   - URL: `https://clinicslothub.com/sitemap.xml`
5. **URL Inspection** für folgende Seiten (einzeln prüfen + Indexierung beantragen):
   - https://clinicslothub.com/de
   - https://clinicslothub.com/en
   - https://clinicslothub.com/de/termin-buchen
   - https://clinicslothub.com/de/kontakt
   - https://clinicslothub.com/de/pricing
   - https://clinicslothub.com/de/impressum
   - https://clinicslothub.com/de/datenschutz

---

## Schritt 2 – Bing Webmaster Tools

1. **Öffne** https://www.bing.com/webmasters/
2. **Seite hinzufügen**: `https://clinicslothub.com`
3. **Verifizierung**: XML-Datei hochladen oder Meta-Tag in Head
4. **Sitemap einreichen**: `https://clinicslothub.com/sitemap.xml`

---

## Schritt 3 – Tägliche Admin-Prüfung nach Go-Live

| Was prüfen | Wo |
|---|---|
| Neue Kontaktnachrichten | https://clinicslothub.com/admin/contact-messages |
| Neue Terminanfragen | https://clinicslothub.com/admin/booking-requests |
| Fehlerlog | https://clinicslothub.com/admin/errors |
| System-Check | https://clinicslothub.com/admin/system-check |

---

## Schritt 4 – Vor bezahlter Werbung (nicht überspringen)

- [ ] Resend API Key konfiguriert → E-Mail-Bestätigungen funktionieren
- [ ] Stripe konfiguriert → Zahlungen live
- [ ] Impressum final geprüft (Rechtsanwalt oder eigene Prüfung)
- [ ] Datenschutzerklärung final geprüft
- [ ] AGB final geprüft
- [ ] AVV final geprüft
- [ ] Keine automatisierte Kaltakquise aktiv
- [ ] `MESSAGING_PROVIDER` nur bewusst auf `twilio_sms` oder `twilio_whatsapp` setzen

---

## Schritt 5 – SEO-Status (bereits erfüllt)

| Prüfpunkt | Status |
|---|---|
| `robots.txt` erreichbar | ✅ |
| `sitemap.xml` erreichbar | ✅ |
| Alle Sitemap-URLs zeigen auf `clinicslothub.com` | ✅ |
| Canonicals: `clinicslothub.com` | ✅ |
| hreflang: 10 Locales, alle `clinicslothub.com` | ✅ |
| Keine alten Namen (PraxisFlow, Clentra) in Live-HTML | ✅ |
| Admin-Bereiche von robots.txt ausgeschlossen | ✅ |
| API-Bereiche von robots.txt ausgeschlossen | ✅ |

---

## Hinweis

Google braucht typischerweise **3–14 Tage** nach Sitemap-Einreichung
für erste Indexierungen. Für neue Domains kann es bis zu 4 Wochen dauern.
Bing ist oft schneller (1–3 Tage).

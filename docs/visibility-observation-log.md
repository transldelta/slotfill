# ClinicSlotHub — Visibility Observation Log

Reine Dokumentation der read-only Sichtbarkeitsprüfungen. **Keine** externen
Dienste, **keine** Tokens, **keine** Accounts.

---

## Tag 0 — 2026-06-19 (Stand: e20288f, LIVE)

**Geprüfte Live-Routen (alle HTTP 200, keine Redirect-Ketten):**
`/de /en /fr /es /pt`, `/de/pricing`, `/de/kontakt`, `/de/blog`,
`/book/testpraxis-delta`, `/sitemap.xml`, `/robots.txt`.

**robots.txt:** ✅ `Allow: /`; private Bereiche blockiert (`/dashboard /admin
/api /auth`, alle Locales); Sitemap referenziert.

**sitemap.xml:** ✅ erreichbar, **65 URLs** (13 je Locale × de/en/es/fr/pt) —
öffentliche Kernseiten + Blog-Artikel.

**Indexability:** ✅ Kernseiten (de/en/fr/es/pt, /pricing, /kontakt, /blog) tragen
**canonical + 5 hreflang** und sind **nicht** noindex (indexierbar). Legal-Seiten
und alte Kampagnenseiten (`/launch /public-launch /share`) korrekt **noindex,
nofollow**. Stillgelegte Locales (ar/zh/…) → **308 → /en**.

**Marke / Copy:** ✅ ClinicSlotHub konsistent sichtbar; **0** sichtbares Slotfill;
keine öffentlichen Technikbegriffe (Stripe/Twilio/SMS/WhatsApp/Supabase) auf
Marketing/Pricing; keine „weltweit"-Widersprüche mehr (Impressum live bereinigt).

**Pricing:** ✅ „ab 29/79/149 € / Monat" + „Patienten zahlen nicht" + „Aktivierung
nach Prüfung" live.

**Kontakt-/Anfragefluss:** ✅ Pricing-CTA „…anfragen" → `/de/kontakt`; Kontaktseite
erklärt nächste Schritte; **kein** Checkout / keine Patientenzahlung / keine
Fehler- oder Falsch-Erfolgsmeldung.

**Console/Hydration:** ✅ 0 Fehler auf den geprüften öffentlichen Seiten.

**Google site:-Check (read-only):** ⏳ programmatisch **nicht aussagekräftig**
(Consent/Bot-Schutz). Manuell im Browser an Tag 7 prüfen.
**Bing site:-Check (read-only):** ⏳ programmatisch **nicht aussagekräftig**.
**Brand-Suche „ClinicSlotHub":** ⏳ noch kein zuverlässiger Treffer per Skript —
für eine frisch (re)deployte Seite **normal**, kein Fehler.

**Offene Punkte:** Organische Indexierung braucht Zeit. Nächster verlässlicher
Check per **manueller** Browser-Suche.

**CEO-Entscheidung (offen, freigabepflichtig):** Google Search Console / Bing
Webmaster Tools / Analytics / Ads / E-Mail-Automation / CRM — derzeit **nicht**
aktiviert.

**Nächster Beobachtungstermin:** Tag 7 (≈ 2026-06-26) — manueller `site:`- und
Brand-Such-Check.

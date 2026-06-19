# Slotfill – Healthcare-Bild-Slots

Echte, lizenzsichere Praxis-/Klinikfotos für die Startseite (`app/[locale]/page.tsx`).

## So aktivierst du ein Foto

1. Lizenzsicheres Foto unter exakt diesem Dateinamen hier ablegen.
2. In `lib/slotfill-images.ts` den passenden Slot auf `enabled: true` setzen.
3. Fertig – `<HealthcareImage>` zeigt das Foto automatisch statt des Platzhalters.

Solange `enabled: false` ist, wird eine markenkonforme Platzhalterfläche
gerendert. Es wird **kein** Bild angefragt (keine 404, keine Console-Errors).

## Erlaubt / Verboten

- ✅ Eigene Aufnahmen, gekaufte Stock-Lizenz, klar lizenzfreie Quelle (z. B. CC0).
- ❌ Keine Hotlinks. ❌ Keine fremden Kliniklogos. ❌ Keine Fake-Testimonials.
- ❌ Keine echten Patientendaten / identifizierbaren Patienten ohne Einwilligung.
- ❌ Keine medizinischen Versprechen, keine Notfall-/Garantie-Motive.

## Benötigte Dateien

| Datei                          | Einsatz / Motiv                                              | Verhältnis | Mindestbreite |
| ------------------------------ | ----------------------------------------------------------- | ---------- | ------------- |
| `hero-doctor-consultation.png` | Hero – Arzt/Ärztin im freundlichen Gespräch (Tablet/Buchung)| 4:5 (hoch) | 1200 px       |
| `patient-mobile-booking.png`   | Patient Booking Flow – Patient bucht per Smartphone         | 3:2        | 1200 px       |
| `clinic-reception.png`         | Provider-/Clinic-Flow – Empfang / Praxisanmeldung           | 3:2        | 1200 px       |
| `clinic-team.png`              | Use Case Klinik / Team / Verwaltung                         | 1:1        | 900 px        |
| `dental-consultation.png`      | Use Case Zahnmedizin – Zahnarztberatung                     | 4:3        | 900 px        |
| `therapy-session.png`          | Use Case Therapiezentrum – Therapie-/Reha-Szene             | 4:3        | 900 px        |
| `healthcare-trust.png`         | Trust / Safety – vertrauensvolles Arzt-Patient-Gespräch     | 3:2        | 1200 px       |

Empfehlung: optimierte JPGs (< 300 KB), warme/ruhige Healthcare-Farben,
echte Menschen, keine gestellte Stock-Künstlichkeit.

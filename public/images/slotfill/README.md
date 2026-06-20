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

## Aktuelle Dateien (ClinicSlotHub-Themenbilder, eingebunden)

| Datei                                  | Einsatz |
| -------------------------------------- | ------- |
| `hero-doctor-appointment-tablet.png`   | Hero – Arzt/Patient mit Buchungs-Tablet |
| `patient-mobile-booking-flow.png`      | Patient Booking Flow – Patientin bucht per Smartphone |
| `clinic-reception-scheduling.png`      | Provider/Clinic Flow – Empfang / Terminplanung |
| `clinic-team-trust.png`                | Online-Booking-Band / Team |
| `dental-appointment-use-case.png`      | Use Case Zahnmedizin |
| `physiotherapy-appointment-use-case.png` | Use Case Physiotherapie |
| `diagnostics-appointment-use-case.png` | Use Case Diagnostik |
| `trust-manual-confirmation.png`        | Trust / manuelle Bestätigung |

Status: Fotos sind eingebunden (`enabled: true` in `lib/slotfill-images.ts`).
Bilder mit fremder Marke / Marketing-Text wurden vor dem Import auf die saubere
Bildfläche gecroppt (kein fremder App-Name sichtbar).

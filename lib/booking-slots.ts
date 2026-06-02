/**
 * lib/booking-slots.ts – Buchungs-Slot-Generierung
 *
 * Pure functions – kein Datenbankzugriff hier.
 * Generiert verfügbare Zeitfenster aus Verfügbarkeitsregeln.
 *
 * weekday: ISO 8601 → 1 = Montag, 7 = Sonntag
 */

// ─── Typen ─────────────────────────────────────────────────────────────────

export interface AvailabilityRule {
  weekday: number;        // 1 = Montag … 7 = Sonntag (ISO 8601)
  start_time: string;     // "HH:MM"
  end_time: string;       // "HH:MM"
  slot_minutes: number;   // Länge eines Zeitfensters
  buffer_minutes: number; // Pufferzeit zwischen Slots
  is_active: boolean;
}

export interface BlockedTime {
  blocked_date: string;      // "YYYY-MM-DD"
  start_time: string | null; // "HH:MM" | null (null = ganzer Tag gesperrt)
  end_time: string | null;   // "HH:MM" | null
}

export interface BookingSlot {
  date: string;  // "YYYY-MM-DD"
  time: string;  // "HH:MM"
  label: string; // UI-Label, z. B. "Mo. 15.01.2024 · 10:00 Uhr"
}

// ─── Interne Hilfsfunktionen ───────────────────────────────────────────────

const WEEKDAY_LABELS = ["", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."];

/**
 * Gibt den ISO-Wochentag zurück (1 = Mo … 7 = So).
 * JS: getDay() liefert 0 (So) … 6 (Sa).
 */
function isoWeekday(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

// ─── Öffentliche Funktionen ────────────────────────────────────────────────

/**
 * Generiert alle Zeitfenster (HH:MM) für eine Verfügbarkeitsregel.
 * Jeder Slot hat Länge `slotMinutes`; zwischen Slots liegt `bufferMinutes`.
 *
 * Beispiel: start=09:00, end=12:00, slot=30, buffer=10 →
 *   09:00, 09:40, 10:20, 11:00, 11:40
 */
export function generateTimeSlotsForRule(
  startTime: string,
  endTime: string,
  slotMinutes: number,
  bufferMinutes: number,
): string[] {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMins = sh * 60 + (sm ?? 0);
  const endMins = eh * 60 + (em ?? 0);
  const step = slotMinutes + bufferMinutes;
  if (step <= 0 || startMins >= endMins) return [];

  const slots: string[] = [];
  for (let m = startMins; m + slotMinutes <= endMins; m += step) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

/**
 * Prüft ob ein Slot durch einen gesperrten Zeitraum blockiert ist.
 */
export function isSlotBlocked(
  date: string,
  time: string,
  blocked: BlockedTime[],
): boolean {
  for (const b of blocked) {
    if (b.blocked_date !== date) continue;
    // Ganzer Tag gesperrt (start_time = null)
    if (b.start_time === null) return true;
    // Zeitbereich-Prüfung: Slot liegt innerhalb des gesperrten Bereichs
    if (b.start_time && b.end_time) {
      if (time >= b.start_time && time < b.end_time) return true;
    }
  }
  return false;
}

/**
 * Formatiert Datum + Zeit für die UI-Anzeige.
 * Beispiel: "Mo. 15.01.2024 · 10:00 Uhr"
 */
export function formatSlotLabel(date: string, time: string): string {
  // date = "YYYY-MM-DD" → T00:00:00 anhängen um Timezone-Fehler zu vermeiden
  const d = new Date(date + "T00:00:00");
  const weekday = WEEKDAY_LABELS[isoWeekday(d)] ?? "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${weekday} ${day}.${month}.${year} · ${time} Uhr`;
}

/**
 * Formatiert ein Datum (YYYY-MM-DD) auf Deutsch: "15.01.2024".
 */
export function formatDateDE(date: string): string {
  const d = new Date(date + "T00:00:00");
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Generiert alle verfügbaren Buchungs-Slots für die nächsten `daysAhead` Tage.
 *
 * Regeln:
 * - Nur Slots mindestens 1 Stunde in der Zukunft
 * - Blockierte Zeiten werden ausgelassen
 * - Inaktive Regeln werden übersprungen
 * - Chronologisch sortiert
 *
 * @param rules    Verfügbarkeitsregeln der Praxis
 * @param blocked  Gesperrte Zeiten der Praxis
 * @param daysAhead Anzahl Tage voraus (default: 14)
 * @param now      Aktueller Zeitpunkt (default: new Date())
 */
export function generateUpcomingSlots(
  rules: AvailabilityRule[],
  blocked: BlockedTime[],
  daysAhead = 14,
  now = new Date(),
): BookingSlot[] {
  const activeRules = rules.filter((r) => r.is_active);
  if (activeRules.length === 0) return [];

  // Frühester buchbarer Zeitpunkt: jetzt + 1 Stunde
  const earliest = new Date(now.getTime() + 60 * 60 * 1000);

  const slots: BookingSlot[] = [];

  for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);

    const weekday = isoWeekday(day);
    const dateStr = day.toISOString().slice(0, 10);

    for (const rule of activeRules) {
      if (rule.weekday !== weekday) continue;

      const times = generateTimeSlotsForRule(
        rule.start_time,
        rule.end_time,
        rule.slot_minutes,
        rule.buffer_minutes,
      );

      for (const time of times) {
        const [hh, mm] = time.split(":").map(Number);
        const slotDate = new Date(day);
        slotDate.setHours(hh ?? 0, mm ?? 0, 0, 0);

        // Slot muss in der Zukunft liegen
        if (slotDate < earliest) continue;
        // Slot darf nicht blockiert sein
        if (isSlotBlocked(dateStr, time, blocked)) continue;

        slots.push({
          date: dateStr,
          time,
          label: formatSlotLabel(dateStr, time),
        });
      }
    }
  }

  // Chronologisch sortieren
  slots.sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
  });

  return slots;
}

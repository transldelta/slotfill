// Zentrale Zeitzonen-Helfer für Europe/Berlin.
// Speicherung erfolgt als UTC (ISO), Eingabe und Anzeige konsequent in Berlin.

const TZ = "Europe/Berlin";

// Liefert den UTC-Offset von Europe/Berlin (in ms) zum gegebenen Zeitpunkt.
function berlinOffsetMs(date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) parts[p.type] = p.value;
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

// Wandelt eine datetime-local-Eingabe ("YYYY-MM-DDTHH:mm"), die als
// Berliner Ortszeit gemeint ist, in einen korrekten UTC-ISO-String um.
export function berlinLocalToUtcIso(local: string): string {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return new Date(local).toISOString();
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const h = +m[4];
  const mi = +m[5];

  const utcGuess = Date.UTC(y, mo - 1, d, h, mi);
  const off1 = berlinOffsetMs(new Date(utcGuess));
  let instant = utcGuess - off1;
  // Zweiter Durchlauf für DST-Randfälle (Offset hängt vom Zeitpunkt ab).
  const off2 = berlinOffsetMs(new Date(instant));
  if (off2 !== off1) instant = utcGuess - off2;

  return new Date(instant).toISOString();
}

// Formatiert einen UTC/ISO-Zeitpunkt als "DD.MM.YYYY HH:mm" in Berliner Zeit.
export function formatBerlin(iso: string): string {
  const dtf = new Intl.DateTimeFormat("de-DE", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return dtf.format(new Date(iso)).replace(",", "");
}

// Liefert den Kalendertag (YYYY-MM-DD) in Berliner Zeit – für Tagesgruppierung.
export function berlinDateKey(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dtf.format(date);
}

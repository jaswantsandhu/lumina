// Time zone helpers: store times as UTC ISO strings, show and edit them in a chosen IANA time zone
// (e.g. a batch's "Asia/Kolkata"), correctly across daylight-saving changes. Built on Intl only.

/** Offset (ms) of `timeZone` from UTC at an instant. */
function offset(ts: number, timeZone: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(ts)
      .map((x) => [x.type, x.value]),
  );
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ts;
}

/** A wall-clock date and time in `timeZone` → UTC ISO string. zonedToISO("2026-10-12", "09:00", "Asia/Kolkata") */
export function zonedToISO(date: string, time: string, timeZone: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, hh, mm);
  let ts = wall - offset(wall, timeZone);
  ts = wall - offset(ts, timeZone); // second pass settles daylight-saving edges
  return new Date(ts).toISOString();
}

/** UTC ISO string → { date: "2026-10-12", time: "09:00" } on the wall clock in `timeZone`. */
export function isoToZoned(iso: string | null | undefined, timeZone: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/**
 * Human-readable time in a time zone, with the zone's abbreviation: "Mon 12 Oct, 09:00 IST".
 * Pass Intl options to change the format; the user's locale is used.
 */
export function formatInTimeZone(
  iso: string | null | undefined,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" },
  locale?: string,
): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(new Date(iso));
}

/** The browser's own time zone, e.g. "Europe/London". */
export const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

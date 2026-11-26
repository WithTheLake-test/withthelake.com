// Private Google Calendar (iCal) reader, without a library (relative imports only).
// Handles all-day and multi-day events, Korea time, and recurrence: DAILY / WEEKLY (BYDAY, WKST) /
// MONTHLY (BYMONTHDAY) / YEARLY (BYMONTH, BYMONTHDAY) with INTERVAL, COUNT, UNTIL, EXDATE and edited
// occurrences (RECURRENCE-ID). Any other rule shows only its first occurrence.
import type { CalendarEvent, CalendarSource } from "../lib/work/types";

const DAY_MS = 86_400_000;
// Seoul is UTC+9 all year, so every time is kept as "Seoul wall-clock" milliseconds.
const SEOUL_MS = 9 * 3600_000;

type Field = { value: string; params: Record<string, string> };
type RawEvent = Record<string, Field[]>;

function parse(text: string): RawEvent[] {
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const events: RawEvent[] = [];
  let current: RawEvent | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") current = {};
    else if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const [name, ...paramParts] = line.slice(0, colon).split(";");
      const params = Object.fromEntries(paramParts.map((p) => p.split("=") as [string, string]));
      (current[name] ??= []).push({ value: line.slice(colon + 1), params });
    }
  }
  return events;
}

const unescape = (value: string) => value.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();

// iCal date/time → Seoul wall-clock ms. UTC ("Z") is shifted; TZID and floating times are read as Seoul time.
function toMs(field: Field | string): { ms: number; allDay: boolean } {
  const value = typeof field === "string" ? field : field.value;
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return { ms: NaN, allDay: false };
  const [, y, mo, d, h, mi, s, z] = m;
  const ms = Date.UTC(+y, +mo - 1, +d, +(h ?? 0), +(mi ?? 0), +(s ?? 0));
  return { ms: z ? ms + SEOUL_MS : ms, allDay: h === undefined };
}

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const timeOf = (ms: number) => new Date(ms).toISOString().slice(11, 16);
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

type Rule = Record<string, string>;

// Occurrence starts (Seoul ms) of a rule, up to `limitMs`. Returns null for unsupported rules.
function occurrences(startMs: number, rule: Rule, limitMs: number): number[] | null {
  const interval = Math.max(1, Number(rule.INTERVAL ?? 1));
  const count = rule.COUNT ? Number(rule.COUNT) : Infinity;
  const until = rule.UNTIL ? toMs(rule.UNTIL).ms : Infinity;
  const timeMs = startMs - Math.floor(startMs / DAY_MS) * DAY_MS;
  const start = new Date(startMs);
  const out: number[] = [];
  const push = (ms: number) => {
    if (ms < startMs) return true;
    if (ms > until || out.length >= count || ms > limitMs) return false;
    out.push(ms);
    return true;
  };

  if (rule.FREQ === "DAILY" && !rule.BYDAY && !rule.BYMONTHDAY) {
    for (let ms = startMs; push(ms); ms += interval * DAY_MS);
    return out;
  }
  if (rule.FREQ === "WEEKLY") {
    const wkst = WEEKDAYS.indexOf(rule.WKST ?? "MO");
    const days = (rule.BYDAY ? rule.BYDAY.split(",") : [WEEKDAYS[start.getUTCDay()]]).map((d) => WEEKDAYS.indexOf(d));
    if (days.some((d) => d < 0)) return null;
    const offsets = days.map((d) => (d - wkst + 7) % 7).sort((a, b) => a - b);
    const startDay = Math.floor(startMs / DAY_MS) * DAY_MS;
    const weekStart = startDay - ((start.getUTCDay() - wkst + 7) % 7) * DAY_MS;
    for (let week = weekStart; ; week += interval * 7 * DAY_MS) {
      for (const offset of offsets) if (!push(week + offset * DAY_MS + timeMs)) return out;
      if (week > limitMs) return out;
    }
  }
  if ((rule.FREQ === "MONTHLY" || rule.FREQ === "YEARLY") && !rule.BYDAY) {
    const monthStep = rule.FREQ === "MONTHLY" ? interval : interval * 12;
    const day = Number(rule.BYMONTHDAY ?? start.getUTCDate());
    const month = rule.BYMONTH ? Number(rule.BYMONTH) - 1 : start.getUTCMonth();
    if (rule.BYMONTH?.includes(",") || rule.BYMONTHDAY?.includes(",") || day < 1) return null;
    for (let i = 0; ; i++) {
      const total = (rule.FREQ === "MONTHLY" ? start.getUTCMonth() : month) + i * monthStep;
      const y = start.getUTCFullYear() + Math.floor(total / 12);
      const mo = total % 12;
      const ms = Date.UTC(y, mo, day) + timeMs;
      if (new Date(ms).getUTCDate() !== day) continue; // e.g. the 31st in a short month
      if (!push(ms)) return out;
      if (ms > limitMs) return out;
    }
  }
  return null;
}

// Name found in a leave title, e.g. "[연차] 김진" or "[종일/휴가] 김진".
const personIn = (title: string, names: string[]) => names.find((name) => title.includes(name));

// `owner` is the person a whole calendar belongs to (the CEO calendar); `names` are looked up in leave titles.
export async function readCalendar(
  url: string,
  source: CalendarSource,
  range: { from: string; to: string },
  people: { owner?: string; names: string[] },
): Promise<CalendarEvent[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iCal ${res.status}`);
  const raw = parse(await res.text()).filter((e) => e.STATUS?.[0]?.value !== "CANCELLED" && e.DTSTART);
  const fromMs = Date.parse(`${range.from}T00:00:00Z`);
  const toMs_ = Date.parse(`${range.to}T23:59:59Z`);

  // Edited occurrences replace the original occurrence with the same UID and start.
  const edited = new Set(raw.filter((e) => e["RECURRENCE-ID"]).map((e) => `${e.UID?.[0]?.value}|${toMs(e["RECURRENCE-ID"][0]).ms}`));

  const out: CalendarEvent[] = [];
  for (const e of raw) {
    const start = toMs(e.DTSTART[0]);
    if (Number.isNaN(start.ms)) continue;
    const end = e.DTEND ? toMs(e.DTEND[0]).ms : start.ms + (start.allDay ? DAY_MS : 0);
    const length = Math.max(0, end - start.ms);
    const title = unescape(e.SUMMARY?.[0]?.value ?? "(제목 없음)");
    const uid = e.UID?.[0]?.value ?? title;
    const rule = e.RRULE && !e["RECURRENCE-ID"] ? (Object.fromEntries(e.RRULE[0].value.split(";").map((p) => p.split("="))) as Rule) : null;
    const excluded = new Set((e.EXDATE ?? []).flatMap((f) => f.value.split(",").map((v) => toMs({ value: v, params: f.params }).ms)));

    const starts = rule ? (occurrences(start.ms, rule, toMs_) ?? [start.ms]) : [start.ms];
    for (const s of starts) {
      if (rule && (excluded.has(s) || edited.has(`${uid}|${s}`))) continue;
      // All-day ends are exclusive in iCal; a timed event ending at midnight also belongs to the previous day.
      const lastMs = start.allDay ? s + length - DAY_MS : s + length - (length > 0 && (s + length) % DAY_MS === 0 ? 1 : 0);
      if (lastMs < fromMs || s > toMs_) continue;
      out.push({
        id: `${source}:${uid}:${s}`,
        source,
        title,
        date: dayOf(s),
        endDate: dayOf(Math.max(s, lastMs)),
        time: start.allDay ? undefined : timeOf(s),
        person: people.owner ?? (source === "leave" ? personIn(title, people.names) : undefined),
      });
    }
  }
  return out.sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
}

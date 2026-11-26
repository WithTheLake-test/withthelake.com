import { members } from "../lib/data/mock";
import type { CalendarEvent, CalendarPart, NotionPart } from "../lib/work/types";
import { cached } from "./cache";
import { readCalendar } from "./ical";
import { createNotion, type NotionEnv } from "./notion";

// Live feed for the home and calendar screens: Notion (5-minute cache) and Google Calendar (15-minute cache).
// Each side fails on its own, so one broken connection never hides the other.

export interface WorkEnv extends NotionEnv {
  GCAL_COMPANY_ICS?: string;
  GCAL_LEAVE_ICS?: string;
  GCAL_CEO_ICS?: string;
}

const NOTION_TTL = 5 * 60_000;
const CALENDAR_TTL = 15 * 60_000;
// Recurring events are expanded for this window around today (enough for the 2-week calendar to page around).
const PAST_DAYS = 120;
const FUTURE_DAYS = 240;

const shiftDay = (days: number) => new Date(Date.now() + 9 * 3600_000 + days * 86_400_000).toISOString().slice(0, 10);

async function loadCalendars(env: WorkEnv): Promise<Omit<CalendarPart, "syncedAt">> {
  if (!env.GCAL_COMPANY_ICS || !env.GCAL_LEAVE_ICS || !env.GCAL_CEO_ICS) throw new Error("구글 캘린더 설정이 없습니다.");
  const range = { from: shiftDay(-PAST_DAYS), to: shiftDay(FUTURE_DAYS) };
  const names = members.map((m) => m.name);
  const ceo = members.find((m) => m.role === "대표")?.name;
  const lists: CalendarEvent[][] = await Promise.all([
    readCalendar(env.GCAL_COMPANY_ICS, "company", range, { names }),
    readCalendar(env.GCAL_CEO_ICS, "ceo", range, { owner: ceo, names }),
    readCalendar(env.GCAL_LEAVE_ICS, "leave", range, { names }),
  ]);
  return { events: lists.flat() };
}

export async function loadWorkFeed(env: WorkEnv, fresh: boolean) {
  const [notion, calendar] = await Promise.allSettled([
    cached("notion-v1", NOTION_TTL, fresh, () => createNotion(env).load()),
    cached("calendar-v1", CALENDAR_TTL, fresh, () => loadCalendars(env)),
  ]);
  if (notion.status === "rejected") console.error("[work] notion", notion.reason);
  if (calendar.status === "rejected") console.error("[work] calendar", calendar.reason);
  return {
    notion: notion.status === "fulfilled" ? ({ ...notion.value.value, syncedAt: notion.value.at } satisfies NotionPart) : null,
    calendar: calendar.status === "fulfilled" ? ({ ...calendar.value.value, syncedAt: calendar.value.at } satisfies CalendarPart) : null,
  };
}

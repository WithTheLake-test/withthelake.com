import { TODAY, addDays, daysBetween, isoWeek, monthDay, startOfWeek, weekStart } from "../date";
import { MOCK_ANCHOR, events, meetings, members, tasks, weeklyGoals } from "./mock";
import type { AppData, Task, WeeklyGoal } from "./types";

// Edits are kept in this browser only. Stored dates stay in mock time (around MOCK_ANCHOR).
const STORAGE_KEY = "backoffice:data";
const VERSION = 1;

export type Stored = { version: number; tasks: Task[]; goals: WeeklyGoal[] };

const fresh = (): Stored => ({ version: VERSION, tasks: structuredClone(tasks), goals: structuredClone(weeklyGoals) });

export function readStored(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stored;
      if (parsed.version === VERSION && Array.isArray(parsed.tasks) && Array.isArray(parsed.goals)) return parsed;
    }
  } catch {}
  return fresh();
}

export function writeStored(data: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearStored() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function onStoredChange(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

// Shift mock time so MOCK_ANCHOR lands on the real today; screens only ever see real dates.
const offset = () => daysBetween(MOCK_ANCHOR, TODAY);
export const toReal = (date: string) => addDays(date, offset());
export const toStored = (date: string) => addDays(date, -offset());

const ANCHOR_WEEKDAY = daysBetween(startOfWeek(MOCK_ANCHOR), MOCK_ANCHOR);
const weekToReal = (week: string) => isoWeek(toReal(addDays(weekStart(week), ANCHOR_WEEKDAY)));

export function toAppData(stored: Stored): AppData {
  return {
    members,
    tasks: stored.tasks.map((task) => ({
      ...task,
      due: toReal(task.due),
      ...(task.doneOn && { doneOn: toReal(task.doneOn) }),
    })),
    goals: stored.goals.map((goal) => ({ ...goal, week: weekToReal(goal.week) })),
    events: events.map((event) => ({ ...event, date: toReal(event.date) })),
    meetings: meetings.map(({ id, name, date }) => {
      const real = toReal(date);
      return { id, date: real, title: `${monthDay(real)} ${name}` };
    }),
  };
}

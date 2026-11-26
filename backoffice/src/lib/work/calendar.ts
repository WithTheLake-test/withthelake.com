// Calendar placement and the automatic overlap checks (from the mockup's development notes).
import { daysBetween, monthDay } from "../date";
import { DONE, dueOf, isOpen, isProject } from "./rules";
import type { CalendarEvent, WorkTask } from "./types";

const PILE_UP = 5; // deadlines on one day
const SAME_DAY = 2; // one person's deadlines on one day

// Where a task shows: on its deadline; a project shows only its end as "종료".
export const calendarDay = (task: WorkTask) => (isProject(task) ? task.end : dueOf(task));

export type Alert = { kind: string; title: string; detail: string };

const short = (from: string, to: string) => (from === to ? `${Number(from.slice(8))}일` : `${Number(from.slice(8))}–${Number(to.slice(8))}일`);

export function findAlerts(days: string[], tasks: WorkTask[], events: CalendarEvent[], today: string): Alert[] {
  const inView = (d?: string) => !!d && d >= days[0] && d <= days.at(-1)!;
  const open = tasks.filter((t) => isOpen(t) && inView(calendarDay(t)));
  const alerts: Alert[] = [];
  const weekday = (d: string) => ["일", "월", "화", "수", "목", "금", "토"][new Date(`${d}T00:00:00Z`).getUTCDay()];

  const crunch = new Set<string>();
  for (const day of days) {
    const due = open.filter((t) => calendarDay(t) === day);
    if (due.length >= PILE_UP) {
      crunch.add(day);
      const ends = due.filter(isProject).length;
      alerts.push({ kind: "마감 쏠림", title: `${monthDay(day)}(${weekday(day)})에 마감 ${due.length}건`, detail: `업무 마감 ${due.length - ends}건${ends ? ` + 프로젝트 종료 ${ends}건` : ""}` });
    }
  }

  for (const leave of events.filter((e) => e.source === "leave" && e.person && e.endDate >= days[0] && e.date <= days.at(-1)!)) {
    // Projects run for weeks, so only regular tasks are checked against leave.
    for (const t of tasks.filter((t) => t.status !== DONE && !isProject(t) && t.assignees.includes(leave.person!))) {
      const end = calendarDay(t);
      const start = t.start ?? end;
      if (!start || !end || start > leave.endDate || end < leave.date) continue;
      alerts.push({
        kind: "연차와 겹침",
        title: `${leave.person} 연차(${short(leave.date, leave.endDate)}) ↔ ${t.title}(${short(start, end)})`,
        detail: `${t.title}은(는) 노션에서 아직 '${t.status}'입니다.`,
      });
    }
  }

  // A day already flagged as a pile-up is not repeated per person.
  for (const day of days.filter((d) => !crunch.has(d))) {
    const people = new Map<string, WorkTask[]>();
    for (const t of open.filter((t) => calendarDay(t) === day)) for (const name of t.assignees) people.set(name, [...(people.get(name) ?? []), t]);
    for (const [name, list] of people) {
      if (list.length < SAME_DAY) continue;
      const when = day === today ? "오늘" : daysBetween(today, day) === 1 ? "내일" : monthDay(day);
      alerts.push({ kind: "같은 날 몰림", title: `${when} ${name} 님 마감 ${list.length}건`, detail: list.map((t) => t.title).join(", ") });
    }
  }
  return alerts;
}

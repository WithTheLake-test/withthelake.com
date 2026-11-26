// Rules for the home and calendar screens (from the mockup's development notes). Pure functions of the live data.
import { addDays, daysBetween } from "../date";
import type { CalendarEvent, ContentItem, SalesItem, WorkTask } from "./types";

export const DONE = "완료";
export const ON_HOLD = "보류";
const PUBLISHED = "발행완료";
const NEEDS_PHOTO = "사진수급필요";
const STALE_PROJECT_DAYS = 21;

// 보류 is left out of the home and calendar screens entirely.
export const visible = (task: WorkTask) => task.status !== ON_HOLD;
export const isOpen = (task: WorkTask) => task.status !== DONE && task.status !== ON_HOLD;
export const isProject = (task: WorkTask) => task.kind === "프로젝트";

// A project with a one-day 목표일정 has only a start date, so it has no deadline.
export const dueOf = (task: WorkTask) => task.end ?? (isProject(task) ? undefined : task.start);

export type Overdue = { task: WorkTask; days: number; stale: boolean };

// Open tasks past their deadline, plus projects with no deadline that started more than 21 days ago.
export function overdueTasks(tasks: WorkTask[], today: string): Overdue[] {
  const out: Overdue[] = [];
  for (const task of tasks.filter(isOpen)) {
    const due = dueOf(task);
    if (due && due < today) out.push({ task, days: daysBetween(due, today), stale: false });
    else if (!due && isProject(task) && task.start && daysBetween(task.start, today) > STALE_PROJECT_DAYS) {
      out.push({ task, days: daysBetween(task.start, today), stale: true });
    }
  }
  return out.sort((a, b) => b.days - a.days);
}

export const dueWithin = (tasks: WorkTask[], today: string, days: number) =>
  tasks.filter((t) => isOpen(t) && !!dueOf(t) && dueOf(t)! >= today && dueOf(t)! <= addDays(today, days));

// Tasks whose date is today: a one-day date, or the last day of a period.
export const tasksOn = (tasks: WorkTask[], day: string) => tasks.filter((t) => isOpen(t) && (t.end ? t.end === day : t.start === day));

export const eventsOn = (events: CalendarEvent[], day: string) => events.filter((e) => e.date <= day && e.endDate >= day);

export function blockedContents(contents: ContentItem[], today: string) {
  const open = contents.filter((c) => c.status !== PUBLISHED);
  const late = open.filter((c) => c.date && c.date < today);
  const notReady = open.filter((c) => !c.date || c.status === NEEDS_PHOTO);
  return { total: new Set([...late, ...notReady]).size, late: late.length, notReady };
}

export const needsPhoto = (c: ContentItem) => c.status === NEEDS_PHOTO;
export const isPublished = (c: ContentItem) => c.status === PUBLISHED;

export const importantSoon = (tasks: WorkTask[], today: string) =>
  dueWithin(tasks, today, 14)
    .filter((t) => t.important)
    .sort((a, b) => dueOf(a)!.localeCompare(dueOf(b)!));

export const NO_OWNER = "담당자 없음";

// Overdue tasks per assignee (a task with several assignees appears under each), oldest first.
export function followUps(overdue: Overdue[]) {
  const groups = new Map<string, Overdue[]>();
  for (const item of overdue) for (const name of item.task.assignees.length ? item.task.assignees : [NO_OWNER]) groups.set(name, [...(groups.get(name) ?? []), item]);
  return [...groups.entries()].map(([name, items]) => ({ name, items })).sort((a, b) => b.items.length - a.items.length);
}

// Government projects in progress, nearest deadline first, with their sub-task progress.
export function governmentProjects(tasks: WorkTask[]) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const all = tasks.filter((t) => t.category === "정부지원과제" && isProject(t));
  const active = all.filter(isOpen).sort((a, b) => (a.end ?? "9999").localeCompare(b.end ?? "9999"));
  return {
    onHold: all.filter((t) => t.status === ON_HOLD).length,
    projects: active.map((project) => {
      const children = project.childIds.map((id) => byId.get(id)).filter((t): t is WorkTask => !!t);
      const done = children.filter((t) => t.status === DONE);
      const lastDone = [...done].sort((a, b) => (dueOf(b) ?? "").localeCompare(dueOf(a) ?? ""))[0];
      const next = children.filter(isOpen).sort((a, b) => (dueOf(a) ?? "9999").localeCompare(dueOf(b) ?? "9999"));
      return { project, total: children.length, done: done.length, note: project.update ?? (lastDone ? `${lastDone.title} 완료` : undefined), next };
    }),
  };
}

export const SALES_GROUPS = [
  { label: "제안서 보내야 함", stages: ["제안서 보내야 함"] },
  { label: "보냄·회신 대기", stages: ["제안서 보냄"] },
  { label: "리드·컨택·미팅", stages: ["리드", "컨택", "미팅"] },
  { label: "성사", stages: ["성사"] },
];

// Needs a nudge: a proposal sent more than 7 days ago, or a next action date already past.
export const salesLate = (item: SalesItem, today: string) =>
  (item.stage === "제안서 보냄" && !!item.proposalSent && addDays(item.proposalSent, 7) < today) || (!!item.nextActionDate && item.nextActionDate < today);

// Red = past, orange = within 3 days, gray = later. Colour is used for status only.
export type Tone = "late" | "soon" | "later";
export const toneOf = (day: string | undefined, today: string): Tone => {
  if (!day) return "later";
  const left = daysBetween(today, day);
  return left < 0 ? "late" : left <= 3 ? "soon" : "later";
};

export function leftLabel(day: string, today: string) {
  const left = daysBetween(today, day);
  if (left === 0) return "오늘";
  return left > 0 ? `${left}일 남음` : `${-left}일 지남`;
}

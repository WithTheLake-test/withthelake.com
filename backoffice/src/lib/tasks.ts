import type { Task } from "./data/types";
import { TODAY, addDays, daysBetween } from "./date";

export const isDone = (task: Task) => task.status === "완료";
export const isOverdue = (task: Task) => !isDone(task) && !!task.due && task.due < TODAY;

// Tasks without a deadline go last.
export const byDue = (a: { due?: string }, b: { due?: string }) => (a.due ?? "9999").localeCompare(b.due ?? "9999");

export const dueWithin = (task: Task, from: string, to: string) => !!task.due && task.due >= from && task.due <= to;

// Notion has no completion date, so "recent" is judged by the deadline.
export const recentlyDone = (task: Task, days: number) => isDone(task) && (!task.due || task.due >= addDays(TODAY, -days));

// Project name from the parent item; top-level items show their category instead.
export const projectLabel = (task: Task, tasks: Task[]) => tasks.find((t) => t.id === task.parentId)?.title ?? task.category;

// "3일 남음" / "오늘" / "2일 지남" / "완료" / "마감일 없음"
export function remainingLabel(task: Task) {
  if (isDone(task)) return "완료";
  if (!task.due) return "마감일 없음";
  const left = daysBetween(TODAY, task.due);
  if (left === 0) return "오늘";
  return left > 0 ? `${left}일 남음` : `${-left}일 지남`;
}

// Assignee filter: any selected member matches; unassigned items show only when everyone is selected.
export const matchesAssignees = (assigneeIds: string[], selected: string[], everyone: boolean) =>
  assigneeIds.length ? assigneeIds.some((id) => selected.includes(id)) : everyone;

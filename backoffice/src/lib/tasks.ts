import type { NewTask, Task, TaskStatus } from "./data/types";
import { TODAY } from "./date";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "시작 전",
  doing: "진행 중",
  review: "확인 필요",
  done: "완료",
};

export const isDone = (task: Task) => task.status === "done";
export const isOverdue = (task: Task) => !isDone(task) && task.due < TODAY;
// Mock tasks finished before the trial have no doneOn; their deadline stands in.
export const doneDate = (task: Task) => task.doneOn ?? task.due;

export const byDue = (a: { due: string }, b: { due: string }) => a.due.localeCompare(b.due);

export const newTaskDraft = (fields: Pick<NewTask, "status" | "assigneeId" | "due">): NewTask => ({
  title: "",
  important: false,
  ...fields,
});

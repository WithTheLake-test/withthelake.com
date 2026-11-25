import { TODAY } from "../date";
import { clearStored, onStoredChange, readStored, toAppData, toStored, writeStored, type Stored } from "./local";
import { members } from "./mock";
import type { AppData, NewTask, Task, WeeklyGoal } from "./types";

// The only data API the screens use. Today it runs on mock data + localStorage;
// connecting Notion / Google Calendar means replacing the bodies in this folder.

export async function getMembers() {
  return members;
}

export async function loadData(): Promise<AppData> {
  return toAppData(readStored());
}

function mutate(change: (data: Stored) => void) {
  const data = readStored();
  change(data);
  writeStored(data);
}

const storeDates = <T extends Partial<NewTask>>(fields: T): T => (fields.due ? { ...fields, due: toStored(fields.due) } : fields);

// Keep doneOn in step with status changes (stored dates are in mock time).
function doneOnFor(current: Pick<Task, "status" | "doneOn"> | undefined, status?: Task["status"]) {
  if (!status) return {};
  if (status !== "done") return { doneOn: undefined };
  return { doneOn: current?.status === "done" ? current.doneOn : toStored(TODAY) };
}

export async function addTask(input: NewTask): Promise<Task> {
  const task = { ...input, id: crypto.randomUUID() };
  mutate((data) => data.tasks.push({ ...storeDates(task), ...doneOnFor(undefined, task.status) }));
  return (await loadData()).tasks.find((t) => t.id === task.id) ?? task;
}

export async function updateTask(id: string, patch: Partial<NewTask>) {
  mutate((data) => {
    data.tasks = data.tasks.map((task) =>
      task.id === id ? { ...task, ...storeDates(patch), ...doneOnFor(task, patch.status) } : task,
    );
  });
}

export async function deleteTask(id: string) {
  mutate((data) => {
    data.tasks = data.tasks.filter((task) => task.id !== id);
  });
}

export async function updateWeeklyGoal(id: string, patch: Pick<WeeklyGoal, "done">) {
  mutate((data) => {
    data.goals = data.goals.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal));
  });
}

export async function resetData() {
  clearStored();
}

export const subscribeData = onStoredChange;

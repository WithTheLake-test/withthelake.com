export type Member = { id: string; name: string; short: string; role: string };

export const TASK_STATUSES = ["todo", "doing", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId?: string;
  due: string;
  important: boolean;
  meetingId?: string;
  description?: string;
  subtasks?: { title: string; done: boolean }[];
  notionUrl?: string;
  doneOn?: string; // date it was marked done; set by the data layer
};

export type Meeting = { id: string; title: string; date: string };

export type WeeklyGoal = { id: string; week: string; title: string; ownerId: string; done: boolean };

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  ownerId: string | "all";
  important?: boolean;
};

export type NewTask = Omit<Task, "id">;

export type AppData = {
  members: Member[];
  tasks: Task[];
  meetings: Meeting[];
  goals: WeeklyGoal[];
  events: CalendarEvent[];
};

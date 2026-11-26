export type Member = { id: string; name: string; short: string; role: string; notionName: string };

// Notion values are kept as-is; when Notion adds a value, update the lists below.
export const TASK_STATUSES = ["준비", "진행중", "완료"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_CATEGORIES = ["개발", "운영", "정부지원과제"] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_KINDS = ["프로젝트", "할 일", "마감·제출", "행사·미팅"] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  important: boolean; // 중요도 "높음"
  assigneeIds: string[];
  start?: string;
  due?: string;
  category: TaskCategory;
  kind: TaskKind;
  parentId?: string;
  meetingTitle?: string;
  memo?: string;
  partner?: string;
  notionUrl: string;
};

export const PUBLISH_STATUSES = ["사진수급필요", "대기", "작성중", "발행대기", "발행완료"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PUBLISH_CATEGORIES = ["기사PR", "홈페이지", "카톡정기메세지", "N블로그", "인스타그램"] as const;
export type PublishCategory = (typeof PUBLISH_CATEGORIES)[number];

export type PublishItem = {
  id: string;
  title: string;
  date?: string;
  status: PublishStatus;
  category: PublishCategory;
  assigneeIds: string[];
  notionUrl: string;
};

// Google Calendar
export type CalendarEvent = { id: string; title: string; date: string; time?: string; ownerId: string | "all" };

export type AppData = { members: Member[]; tasks: Task[]; publishes: PublishItem[]; events: CalendarEvent[] };

// Live data for the home and calendar screens (Notion + Google Calendar), shared by the server and the screens.

export type WorkTask = {
  id: string;
  title: string;
  url: string;
  status: string; // Notion 진행상태 as-is
  important: boolean; // 중요도 = 높음
  kind?: string; // 구분
  category?: string; // 카테고리
  assignees: string[]; // 담당자 names
  start?: string; // YYYY-MM-DD (Seoul)
  end?: string;
  time?: string; // HH:MM when the start has a time
  parentIds: string[];
  childIds: string[];
  update?: string; // 이번 주 업데이트
};

export type ContentItem = { id: string; title: string; url: string; status: string; date?: string; category?: string };

export type SalesItem = {
  id: string;
  name: string;
  url: string;
  stage: string;
  proposalSent?: string;
  nextActionDate?: string;
  nextAction?: string;
  amount?: number;
  owners: string[];
};

export type WeeklyGoal = { id: string; title: string; url: string; week?: string; assignees: string[]; done: boolean };

export type CalendarSource = "company" | "ceo" | "leave";

export type CalendarEvent = {
  id: string;
  source: CalendarSource;
  title: string;
  date: string; // first day (Seoul)
  endDate: string; // last day, inclusive
  time?: string; // HH:MM for timed events
  person?: string; // owner: the CEO calendar, or the name found in a leave title
};

// One row of the 💳 구독·정기결제 DB. `date` is any past or next billing date; the cycle decides which months it repeats in.
export type Payment = {
  id: string;
  url: string;
  name: string;
  plan?: string;
  users: string[];
  cycle?: string; // 매월 | 6개월 | 매년 | 1회 | 무료
  date?: string;
  currency?: string; // 원 | 달러
  amount?: number; // one charge in its own currency (1인 금액 × 인원)
  krw?: number; // the same charge in won, when known
  method?: string;
  status?: string;
};

export type NotionPart = {
  tasks: WorkTask[];
  contents: ContentItem[];
  sales: SalesItem[];
  goals?: WeeklyGoal[];
  goalsError?: string;
  payments?: Payment[];
  paymentsError?: string;
  syncedAt: number;
};
export type CalendarPart = { events: CalendarEvent[]; syncedAt: number };

export type WorkFeed = { notion: NotionPart | null; calendar: CalendarPart | null; errors?: { notion?: string; calendar?: string } };

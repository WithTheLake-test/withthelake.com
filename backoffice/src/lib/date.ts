const pad = (n: number) => String(n).padStart(2, "0");

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const TODAY = localToday();

export const WEEKDAY_HEADERS = ["월", "화", "수", "목", "금", "토", "일"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);
const toStr = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (date: string, days: number) => toStr(new Date(toDate(date).getTime() + days * DAY_MS));
export const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY_MS);
export const startOfWeek = (date: string) => addDays(date, -((toDate(date).getUTCDay() + 6) % 7));
export const endOfWeek = (date: string) => addDays(startOfWeek(date), 6);

// "11월 27일"
export const monthDay = (date: string) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일`;
// "11월 27일 (금)"
export const fullDate = (date: string) => `${monthDay(date)} (${WEEKDAYS[toDate(date).getUTCDay()]})`;

// "11월 23일 ~ 29일", or "11월 30일 ~ 12월 6일" across months
export function dateRange(start: string, end: string) {
  const endLabel = start.slice(0, 7) === end.slice(0, 7) ? `${Number(end.slice(8))}일` : monthDay(end);
  return `${monthDay(start)} ~ ${endLabel}`;
}

// "14:00" -> "오후 2:00"
export function timeLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const h12 = hour % 12 || 12;
  return `${hour < 12 ? "오전" : "오후"} ${h12}:${pad(minute)}`;
}

export function isoWeek(date: string) {
  const thursday = addDays(startOfWeek(date), 3);
  const year = thursday.slice(0, 4);
  const week = Math.floor(daysBetween(`${year}-01-01`, thursday) / 7) + 1;
  return `${year}-W${pad(week)}`;
}

export function weekStart(week: string) {
  const [year, num] = week.split("-W");
  return addDays(startOfWeek(`${year}-01-04`), (Number(num) - 1) * 7);
}

export const monthOf = (date: string) => date.slice(0, 7);

export function addMonths(month: string, months: number) {
  const [year, m] = month.split("-").map(Number);
  return toStr(new Date(Date.UTC(year, m - 1 + months, 1))).slice(0, 7);
}

export const endOfMonth = (month: string) => addDays(`${addMonths(month, 1)}-01`, -1);

export function monthLabel(month: string) {
  const [year, m] = month.split("-");
  return `${year}년 ${Number(m)}월`;
}

export function monthGrid(month: string) {
  const start = startOfWeek(`${month}-01`);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

import type { Payment } from "./types";

// A payment that falls in the month of `today`, on `day`.
export type DuePayment = Payment & { day: string };

const pad = (n: number) => String(n).padStart(2, "0");
const lastDayOf = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

// Months between the base date and this month, by cycle: 매월 every month, 6개월 every 6th, 매년 every 12th.
const STEP: Record<string, number> = { 매월: 1, "6개월": 6, 매년: 12 };

// Which payments are charged this month, and on which day.
// The 결제일 in Notion can be any past or next charge: 매월 uses its day, 6개월·매년 its month and day.
// A day past the month's end (e.g. 31) moves to the last day. 1회 counts only in its own month; 무료 and 해지 never.
export function paymentsThisMonth(payments: Payment[], today: string): DuePayment[] {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const due: DuePayment[] = [];
  for (const p of payments) {
    if (!p.date || p.status === "해지" || p.cycle === "무료") continue;
    const baseMonth = Number(p.date.slice(5, 7));
    const baseDay = Number(p.date.slice(8, 10));
    if (p.cycle === "1회") {
      if (p.date.slice(0, 7) === today.slice(0, 7)) due.push({ ...p, day: p.date });
      continue;
    }
    const step = STEP[p.cycle ?? ""];
    if (!step || (((month - baseMonth) % step) + step) % step !== 0) continue;
    due.push({ ...p, day: `${year}-${pad(month)}-${pad(Math.min(baseDay, lastDayOf(year, month)))}` });
  }
  return due.sort((a, b) => a.day.localeCompare(b.day) || a.name.localeCompare(b.name));
}

// Rows the card can't place in a month, so they can be filled in on Notion.
export const missingDate = (payments: Payment[]) =>
  payments.filter((p) => !p.date && p.status !== "해지" && p.cycle !== "무료" && p.cycle !== "1회");

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

// "108,000원", or "$22.68" while the exchange rate is still empty.
export function amountLabel(p: Payment) {
  if (p.krw !== undefined) return won(p.krw);
  if (p.amount === undefined || p.amount === 0) return p.amount === 0 ? "0원" : "금액 미입력";
  return p.currency === "달러" ? `$${p.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : won(p.amount);
}

import type { ReactNode } from "react";
import { TODAY, WEEKDAY_HEADERS, addMonths, monthGrid, monthLabel } from "@/lib/date";
import { outlineButton } from "./Button";

type Props = {
  month: string;
  renderDay: (date: string) => ReactNode;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
};

export default function MonthCalendar({ month, renderDay, selectedDate, onSelectDate }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="px-3 py-2.5 text-muted">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthGrid(month).map((date, i) => {
          const inMonth = date.startsWith(month);
          const selected = inMonth && date === selectedDate;
          return (
            <div
              key={date}
              onClick={inMonth && onSelectDate ? () => onSelectDate(date) : undefined}
              className={`min-h-28 min-w-0 border-line p-2 ${i % 7 ? "border-l" : ""} ${i >= 7 ? "border-t" : ""} ${
                inMonth ? (onSelectDate ? "cursor-pointer hover:bg-canvas" : "") : "bg-canvas"
              } ${selected ? "bg-soft/60" : ""}`}
            >
              <span
                className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 ${
                  date === TODAY ? "bg-accent font-semibold text-white" : inMonth ? "text-ink" : "text-faint/70"
                }`}
              >
                {Number(date.slice(8))}
              </span>
              {inMonth && <div className="mt-1 space-y-1">{renderDay(date)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonthNav({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(addMonths(month, -1))} className={outlineButton}>
        ‹ 이전 달
      </button>
      <span className="min-w-32 text-center text-xl font-bold">{monthLabel(month)}</span>
      <button type="button" onClick={() => onChange(addMonths(month, 1))} className={outlineButton}>
        다음 달 ›
      </button>
    </div>
  );
}

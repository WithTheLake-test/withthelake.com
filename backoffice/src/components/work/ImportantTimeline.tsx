import { addDays, daysBetween, monthDay } from "@/lib/date";
import { dueOf, leftLabel, toneOf } from "@/lib/work/rules";
import type { WorkTask } from "@/lib/work/types";
import { TONE_PILL, TONE_TEXT, cardClass } from "./ui";

const SPAN = 14;
const CARD_COLUMNS = 3;

// Important tasks over the next two weeks, placed by days left; tasks on the same day stack in one card.
export default function ImportantTimeline({ tasks, parent, category, today }: { tasks: WorkTask[]; parent: (t: WorkTask) => string | undefined; category: (t: WorkTask) => string; today: string }) {
  const groups = [...new Set(tasks.map((t) => dueOf(t)!))].map((day) => ({ day, items: tasks.filter((t) => dueOf(t) === day) }));
  const ticks = [0, 4, 7, 11, 14].map((d) => addDays(today, d));

  return (
    <div className={cardClass}>
      <div className="relative mb-4 h-10">
        <div className="absolute top-7 right-2 left-2 h-px bg-line" />
        {ticks.map((day, i) => (
          <div key={day} className={`absolute top-0 text-sm whitespace-nowrap text-muted ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `calc(${(daysBetween(today, day) / SPAN) * 96 + 2}%)` }}>
            <p className={i === 0 ? "font-semibold text-danger" : ""}>{i === 0 ? `오늘 ${Number(day.slice(8))}일` : i === ticks.length - 1 ? `D-14 · ${monthDay(day)}` : monthDay(day)}</p>
          </div>
        ))}
        {groups.map(({ day }) => (
          <span key={day} className={`absolute top-[25px] h-2.5 w-2.5 -translate-x-1/2 rounded-full ${toneOf(day, today) === "later" ? "bg-faint" : "bg-danger"}`} style={{ left: `calc(${(daysBetween(today, day) / SPAN) * 96 + 2}%)` }} />
        ))}
      </div>
      {groups.length === 0 ? (
        <p className="py-4 text-center text-muted">2주 안에 마감하는 중요 업무가 없습니다.</p>
      ) : (
        <div className="grid grid-flow-row-dense gap-2" style={{ gridTemplateColumns: `repeat(${SPAN + 1}, minmax(0, 1fr))` }}>
          {groups.map(({ day, items }) => {
            const tone = toneOf(day, today);
            const column = Math.min(daysBetween(today, day), SPAN + 1 - CARD_COLUMNS) + 1;
            return (
              <div key={day} className={`space-y-2 rounded-lg px-3 py-2.5 ${TONE_PILL[tone]}`} style={{ gridColumn: `${column} / span ${CARD_COLUMNS}` }}>
                {items.map((t) => (
                  <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className="block">
                    <p className={`text-sm font-semibold ${TONE_TEXT[tone]}`}>
                      {leftLabel(day, today)}
                      {day !== today && ` · ${monthDay(day)}`}
                    </p>
                    <p className="font-semibold text-ink">{t.title}</p>
                    {parent(t) && <p className="text-sm font-bold text-ink">{parent(t)}</p>}
                    <p className="text-sm text-muted">{category(t)}</p>
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

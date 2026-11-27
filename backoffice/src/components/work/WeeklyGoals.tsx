import Checkbox from "@/components/Checkbox";
import ExternalLink from "@/components/ExternalLink";
import { endOfWeek, startOfWeek } from "@/lib/date";
import { NOTION_HOME_URL } from "@/lib/links";
import type { WeeklyGoal } from "@/lib/work/types";
import { Unavailable, cardClass } from "./ui";

const short = (day: string) => `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`;

// This week's 공동 주간목표 from Notion (read-only; goals are added and checked in Notion).
// A goal belongs to the week its 주 date falls in, so any day of the week works, not only Monday.
export default function WeeklyGoals({ goals, today }: { goals?: WeeklyGoal[]; today: string }) {
  if (!goals) return <Unavailable source="노션" />;
  const from = startOfWeek(today);
  const to = endOfWeek(today);
  const week = goals.filter((g) => g.week && g.week >= from && g.week <= to).sort((a, b) => Number(a.done) - Number(b.done));
  const done = week.filter((g) => g.done).length;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">공동 주간목표</h3>
        <span className="text-sm text-muted">
          {short(from)} – {short(to)}
        </span>
      </div>
      {week.length === 0 ? (
        <p className="py-6 text-center text-muted">이번 주 목표가 아직 없습니다.</p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              {week.length}개 중 {done}개 달성
            </span>
            <span className="text-muted">{Math.round((done / week.length) * 100)}%</span>
          </div>
          <ul className="mt-3 space-y-3">
            {week.map((g) => (
              <li key={g.id} className="flex items-start gap-3">
                <Checkbox label={g.title} checked={g.done} />
                <a href={g.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                  <p className={g.done ? "text-faint line-through" : ""}>{g.title}</p>
                  <p className={`text-sm ${g.assignees.length ? "text-muted" : "text-danger"}`}>{g.assignees.join(" · ") || "미지정"}</p>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <ExternalLink href={NOTION_HOME_URL} className="mt-4 inline-block text-sm text-muted hover:text-ink">
        노션에서 목표 추가·체크
      </ExternalLink>
    </div>
  );
}

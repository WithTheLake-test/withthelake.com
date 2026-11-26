import { daysBetween, monthDay } from "@/lib/date";
import { dueOf, leftLabel, toneOf, type governmentProjects } from "@/lib/work/rules";
import { Pill, TONE_TEXT, cardClass } from "./ui";

type Item = ReturnType<typeof governmentProjects>["projects"][number];

const dueBadge = (day: string | undefined, today: string) => {
  if (!day) return <span className="text-sm text-muted">마감일 없음</span>;
  const left = daysBetween(today, day);
  return (
    <Pill tone={toneOf(day, today)} strong={left <= 0}>
      {left === 0 ? "오늘" : left < 0 ? `${-left}일 지남` : `${monthDay(day)} · D-${left}`}
    </Pill>
  );
};

// One government project: sub-task progress, this week's note, and what comes next.
export default function GovProject({ item, today }: { item: Item; today: string }) {
  const { project, total, done, note, next } = item;
  const urgent = project.end !== undefined && daysBetween(today, project.end) <= 0;
  return (
    <div className={`${cardClass} ${urgent ? "border-red-200" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold">{project.title}</h3>
        {dueBadge(project.end, today)}
      </div>
      <p className="mt-3 text-sm font-semibold text-muted">현재 진행상황</p>
      {total > 0 ? (
        <>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
              <div className="h-full rounded-full bg-ink" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <span className="text-sm text-muted">
              {done}/{total}
            </span>
          </div>
          <p className="mt-2">{note ?? <span className="text-muted">이번 주 업데이트 없음</span>}</p>
        </>
      ) : (
        <p className="mt-2 text-muted">{note ?? "하위 업무가 없어서 진행률을 알 수 없습니다"}</p>
      )}
      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-sm font-semibold text-muted">앞으로 할 것</p>
        {next.length === 0 && <p className="text-muted">아직 적힌 것이 없습니다</p>}
        <ul className="space-y-1.5">
          {next.map((t) => {
            const due = dueOf(t);
            const untitled = t.title === "제목 없는 업무";
            const tone = toneOf(due, today);
            return (
              <li key={t.id} className="flex items-baseline justify-between gap-3">
                <span className={`min-w-0 truncate ${untitled ? "text-orange-600" : ""}`}>{t.title}</span>
                <span className={`shrink-0 text-sm ${tone === "later" ? "text-muted" : `font-semibold ${TONE_TEXT[tone]}`}`}>
                  {due ? (tone === "late" || due === today ? leftLabel(due, today) : monthDay(due)) : "날짜 없음"}
                  {t.time && due === today && ` ${t.time}`} · {t.assignees.join("·") || "담당 없음"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline underline-offset-4">
        노션에서 열기 →
      </a>
    </div>
  );
}

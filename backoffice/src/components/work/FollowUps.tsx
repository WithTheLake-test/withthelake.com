import Link from "next/link";
import { outlineButton } from "@/components/Button";
import type { Overdue } from "@/lib/work/rules";
import { Pill, cardClass } from "./ui";

type Group = { name: string; items: Overdue[] };

// "김민주" → "민", "김진" → "진"
const initialOf = (name: string) => (name.length === 3 ? name[1] : name.at(-1));

// Overdue tasks per assignee, oldest first.
export default function FollowUps({ groups, project }: { groups: Group[]; project: (o: Overdue) => string }) {
  return (
    <div className={cardClass}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">팔로업 필요</h3>
        <span className="text-sm text-muted">마감 지난 업무 · 담당자별 · 오래된 순</span>
      </div>
      {groups.length === 0 && <p className="py-6 text-center text-muted">마감 지난 업무가 없습니다.</p>}
      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.name}>
            <p className="mb-2 flex items-center gap-2 font-semibold">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-soft text-xs">{initialOf(g.name)}</span>
              {g.name} <span className="text-sm font-normal text-muted">{g.items.length}건</span>
            </p>
            <ul className="space-y-2">
              {g.items.map((o) => (
                <li key={o.task.id}>
                  <a href={o.task.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3.5 py-2.5 hover:bg-soft">
                    <span className="min-w-0">
                      <span className="block truncate">{o.task.title}</span>
                      <span className="block truncate text-sm text-muted">{project(o)}</span>
                    </span>
                    <Pill tone="late" strong={o.days >= 3}>
                      {o.stale ? `${o.days}일째` : `${o.days}일 지남`}
                    </Pill>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href="/progress" className={`${outlineButton} mt-4`}>
        진행 현황에서 전체 보기 →
      </Link>
    </div>
  );
}

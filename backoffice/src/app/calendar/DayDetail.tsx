"use client";

import type { ReactNode } from "react";
import Assignees from "@/components/Assignees";
import { outlineButton } from "@/components/Button";
import { CardRow } from "@/components/Card";
import ExternalLink from "@/components/ExternalLink";
import type { CalendarEvent, PublishItem, Task } from "@/lib/data/types";
import { TODAY, fullDate, timeLabel } from "@/lib/date";
import { GOOGLE_CALENDAR_URL, NOTION_TASKS_URL } from "@/lib/links";
import { CATEGORY_SHORT, isPublished, needsPhoto } from "@/lib/publishes";
import { useData } from "@/lib/store";
import { isDone, isOverdue, projectLabel } from "@/lib/tasks";
import { useUser } from "@/lib/user";

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <>
      <h3 className="mt-5 border-b border-line pb-2 font-bold">
        {title} {count}건
      </h3>
      <ul>{children}</ul>
    </>
  );
}

function TwoLine({ main, sub, faded, alert }: { main: string; sub: string; faded?: boolean; alert?: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      <p className={`truncate ${faded ? "text-faint line-through" : alert ? "text-danger" : ""}`}>{main}</p>
      <p className={`truncate text-sm ${alert && !faded ? "text-danger" : "text-muted"}`}>{sub}</p>
    </div>
  );
}

type Props = { date: string; events: CalendarEvent[]; tasks: Task[]; publishes: PublishItem[] };

export default function DayDetail({ date, events, tasks, publishes }: Props) {
  const { memberOf } = useUser();
  const { tasks: allTasks } = useData();

  return (
    <section className="rounded-xl border border-line bg-white px-6 py-5">
      <h2 className="text-lg font-bold">
        {fullDate(date)}
        {date === TODAY && " · 오늘"}
      </h2>
      <p className="mt-1 text-muted">날짜를 누르면 해당 날짜의 내용이 표시됩니다.</p>

      <Section title="일정" count={events.length}>
        {events.map((event) => (
          <CardRow key={event.id}>
            <span className="w-[72px] shrink-0 text-muted">{event.time ? timeLabel(event.time) : "종일"}</span>
            <span className="min-w-0 flex-1 truncate">{event.title}</span>
            <span className="shrink-0 text-muted">{event.ownerId === "all" ? "전체" : memberOf(event.ownerId)?.name}</span>
          </CardRow>
        ))}
      </Section>

      <Section title="업무 마감" count={tasks.length}>
        {tasks.map((task) => (
          <CardRow key={task.id}>
            <TwoLine main={task.title} sub={projectLabel(task, allTasks)} faded={isDone(task)} alert={isOverdue(task)} />
            <Assignees ids={task.assigneeIds} muted className="max-w-24 shrink-0 text-right" />
          </CardRow>
        ))}
      </Section>

      <Section title="발행" count={publishes.length}>
        {publishes.map((item) => (
          <CardRow key={item.id}>
            <TwoLine
              main={item.title}
              sub={`${CATEGORY_SHORT[item.category]} · ${item.status}`}
              faded={isPublished(item)}
              alert={needsPhoto(item)}
            />
            <Assignees ids={item.assigneeIds} muted className="max-w-24 shrink-0 text-right" />
          </CardRow>
        ))}
      </Section>

      <div className="mt-5 space-y-2">
        <ExternalLink href={GOOGLE_CALENDAR_URL} pendingMessage="구글 캘린더 연결 후 열립니다." className={`${outlineButton} w-full`}>
          구글 캘린더에서 일정 추가
        </ExternalLink>
        <ExternalLink href={NOTION_TASKS_URL} className={`${outlineButton} w-full`}>
          노션에서 업무 추가
        </ExternalLink>
      </div>
    </section>
  );
}

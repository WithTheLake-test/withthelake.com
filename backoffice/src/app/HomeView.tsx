"use client";

import Link from "next/link";
import Assignees from "@/components/Assignees";
import Card, { CardRow } from "@/components/Card";
import DueLabel from "@/components/DueLabel";
import StatusBadge from "@/components/StatusBadge";
import type { Task } from "@/lib/data/types";
import { TODAY, addDays, daysBetween, endOfWeek, fullDate, startOfWeek, timeLabel } from "@/lib/date";
import { CATEGORY_SHORT } from "@/lib/publishes";
import { useData } from "@/lib/store";
import { byDue, dueWithin, isDone, isOverdue, projectLabel, recentlyDone } from "@/lib/tasks";
import { useUser } from "@/lib/user";

const MY_TASK_LIMIT = 5;
const WEEK_START = startOfWeek(TODAY);
const WEEK_END = endOfWeek(TODAY);

function CardLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="hover:text-ink">
      {children} →
    </Link>
  );
}

// Task title with its project (or category) underneath.
function TaskTitle({ task, tasks }: { task: Task; tasks: Task[] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className={`truncate ${isDone(task) ? "text-faint line-through" : ""}`}>{task.title}</p>
      <p className="truncate text-sm text-muted">{projectLabel(task, tasks)}</p>
    </div>
  );
}

const Empty = ({ children }: { children: string }) => <p className="py-6 text-center text-muted">{children}</p>;

export default function HomeView() {
  const { user, memberOf } = useUser();
  const { tasks, publishes, events } = useData();

  const mine = tasks.filter((task) => task.assigneeIds.includes(user.id));
  const myOpen = mine.filter((task) => !isDone(task)).sort(byDue);
  const myTasks = [...myOpen, ...mine.filter((task) => recentlyDone(task, 7))].slice(0, MY_TASK_LIMIT);
  const dueSoon = myOpen.filter((task) => dueWithin(task, TODAY, addDays(TODAY, 7))).length;
  const myOverdue = myOpen.filter(isOverdue).length;

  const important = tasks
    .filter((task) => task.important && !isDone(task) && dueWithin(task, TODAY, addDays(TODAY, 14)))
    .sort(byDue);
  const todayEvents = events.filter((event) => event.date === TODAY).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const weekPublishes = publishes
    .filter((item) => item.date && item.date >= WEEK_START && item.date <= WEEK_END)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const urgent = tasks.filter((task) => !isDone(task) && !!task.due && task.due <= WEEK_END).sort(byDue);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold">{user.name} 님, 안녕하세요</h1>
        <p className="mt-1.5 text-base text-muted">
          {fullDate(TODAY)} · 7일 안에 마감할 내 업무 <strong className="text-ink">{dueSoon}건</strong> · 마감 지난 내 업무{" "}
          <strong className={myOverdue > 0 ? "text-danger" : "text-ink"}>{myOverdue}건</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card title="내 업무" action={<CardLink href="/progress">진행 현황</CardLink>}>
          <ul>
            {myTasks.map((task) => (
              <CardRow key={task.id}>
                <TaskTitle task={task} tasks={tasks} />
                <DueLabel task={task} muted className="shrink-0" />
              </CardRow>
            ))}
          </ul>
          {myTasks.length === 0 && <Empty>담당 업무 없음</Empty>}
        </Card>

        <Card title="중요 일정" action="중요도 높음 · 2주 이내">
          <ul>
            {important.map((task) => {
              const left = daysBetween(TODAY, task.due!);
              return (
                <CardRow key={task.id}>
                  <span className={`w-20 shrink-0 font-bold ${left <= 3 ? "text-danger" : ""}`}>
                    {left === 0 ? "오늘" : `${left}일 남음`}
                  </span>
                  <TaskTitle task={task} tasks={tasks} />
                  <span className="shrink-0 text-muted">{fullDate(task.due!)}</span>
                </CardRow>
              );
            })}
          </ul>
          {important.length === 0 && <Empty>2주 이내 중요 업무 없음</Empty>}
        </Card>

        <Card title="오늘 일정" action="구글 캘린더">
          <ul>
            {todayEvents.map((event) => (
              <CardRow key={event.id}>
                <span className="w-24 shrink-0">{event.time ? timeLabel(event.time) : "종일"}</span>
                <span className="min-w-0 flex-1 truncate">{event.title}</span>
                <span className="shrink-0 text-muted">{event.ownerId === "all" ? "전체" : memberOf(event.ownerId)?.name}</span>
              </CardRow>
            ))}
          </ul>
          {todayEvents.length === 0 && <Empty>오늘 일정 없음</Empty>}
        </Card>

        <Card title="이번 주 발행" action={<CardLink href="/calendar">캘린더</CardLink>}>
          <ul>
            {weekPublishes.map((item) => (
              <CardRow key={item.id}>
                <span className="w-28 shrink-0 text-muted">{fullDate(item.date!)}</span>
                <span className="w-16 shrink-0 text-muted">{CATEGORY_SHORT[item.category]}</span>
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <Assignees ids={item.assigneeIds} muted className="w-14 shrink-0 text-right" />
                <span className="flex w-24 shrink-0 justify-end">
                  <StatusBadge status={item.status} />
                </span>
              </CardRow>
            ))}
          </ul>
          {weekPublishes.length === 0 && <Empty>이번 주 발행 예정 없음</Empty>}
        </Card>

        <Card title="마감 임박·지난 업무 (팀 전체)" action={<CardLink href="/progress">진행 현황</CardLink>} className="col-span-2">
          <ul>
            {urgent.map((task) => (
              <CardRow key={task.id}>
                <TaskTitle task={task} tasks={tasks} />
                <Assignees ids={task.assigneeIds} muted className="w-32 shrink-0 text-right" />
                <DueLabel task={task} className="w-20 shrink-0 text-right" />
              </CardRow>
            ))}
          </ul>
          {urgent.length === 0 && <Empty>마감 임박·지난 업무 없음</Empty>}
        </Card>
      </div>
    </>
  );
}

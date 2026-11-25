"use client";

import Link from "next/link";
import Card, { CardRow } from "@/components/Card";
import Checkbox from "@/components/Checkbox";
import StatusBadge from "@/components/StatusBadge";
import { TODAY, addDays, daysBetween, endOfWeek, fullDate, isoWeek, timeLabel } from "@/lib/date";
import { useData, useStoreActions } from "@/lib/store";
import { byDue, doneDate, isDone, isOverdue } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import WeeklyGoalsCard from "./WeeklyGoalsCard";

const IMPORTANT_WITHIN_DAYS = 14;
const WEEK_END = endOfWeek(TODAY);

function CardLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="hover:text-ink">
      {children} →
    </Link>
  );
}

export default function HomeView() {
  const { user, memberOf } = useUser();
  const { tasks, events, goals } = useData();
  const { toggleTaskDone: toggleDone } = useStoreActions();

  const mine = tasks.filter((task) => task.assigneeId === user.id);
  // Tasks finished on earlier days are history, not part of this list.
  const myTasks = mine.filter((task) => task.due <= WEEK_END && (!isDone(task) || doneDate(task) >= TODAY)).sort(byDue);
  const dueToday = mine.filter((task) => task.due === TODAY && !isDone(task)).length;
  const overdue = mine.filter(isOverdue).length;

  const important = events
    .filter((event) => event.important && event.date >= TODAY && event.date <= addDays(TODAY, IMPORTANT_WITHIN_DAYS))
    .sort((a, b) => a.date.localeCompare(b.date));
  const todayEvents = events
    .filter((event) => event.date === TODAY)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const teamDue = tasks.filter((task) => !isDone(task) && task.due >= TODAY && task.due <= WEEK_END).sort(byDue);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[26px] font-bold">{user.name} 님, 안녕하세요</h1>
        <p className="mt-1.5 text-base text-muted">
          {fullDate(TODAY)} · 오늘 마감 업무 <strong className="text-ink">{dueToday}건</strong> · 마감 지난 업무{" "}
          <strong className={overdue > 0 ? "text-danger" : "text-ink"}>{overdue}건</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card title="내 업무" action={<CardLink href="/progress">진행 현황</CardLink>}>
          <ul>
            {myTasks.map((task) => {
              const done = isDone(task);
              const late = isOverdue(task);
              return (
                <CardRow key={task.id}>
                  <Checkbox label={task.title} checked={done} onChange={() => toggleDone(task)} />
                  <span className={`min-w-0 flex-1 truncate ${done ? "text-faint line-through" : late ? "text-danger" : ""}`}>
                    {task.title}
                  </span>
                  <span className={`shrink-0 ${late ? "text-danger" : "text-muted"}`}>
                    {late ? "마감 지남" : task.due === TODAY ? "오늘" : fullDate(task.due)}
                  </span>
                </CardRow>
              );
            })}
            {myTasks.length === 0 && <p className="py-6 text-center text-muted">이번 주 업무 없음</p>}
          </ul>
        </Card>

        <Card title="중요 일정" action="2주 이내">
          <ul>
            {important.map((event) => {
              const left = daysBetween(TODAY, event.date);
              return (
                <CardRow key={event.id}>
                  <span className={`w-20 shrink-0 font-bold ${left <= 3 ? "text-danger" : ""}`}>
                    {left === 0 ? "오늘" : `${left}일 남음`}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{event.title}</span>
                  <span className="shrink-0 text-muted">{fullDate(event.date)}</span>
                </CardRow>
              );
            })}
            {important.length === 0 && <p className="py-6 text-center text-muted">2주 이내 중요 일정 없음</p>}
          </ul>
        </Card>

        <Card title="오늘 일정" action={<CardLink href="/calendar">캘린더</CardLink>}>
          <ul>
            {todayEvents.map((event) => (
              <CardRow key={event.id}>
                <span className="w-24 shrink-0">{event.time ? timeLabel(event.time) : "종일"}</span>
                <span className="min-w-0 flex-1 truncate">{event.title}</span>
                <span className="shrink-0 text-muted">{event.ownerId === "all" ? "전체" : memberOf(event.ownerId)?.name}</span>
              </CardRow>
            ))}
            {todayEvents.length === 0 && <p className="py-6 text-center text-muted">오늘 일정 없음</p>}
          </ul>
        </Card>

        <WeeklyGoalsCard goals={goals.filter((goal) => goal.week === isoWeek(TODAY))} />

        <Card title="이번 주 마감 업무 (팀 전체)" action={<CardLink href="/progress">진행 현황</CardLink>} className="col-span-2">
          <ul>
            {teamDue.map((task) => {
              const assignee = memberOf(task.assigneeId);
              return (
                <CardRow key={task.id}>
                  <span className="w-32 shrink-0 text-muted">{fullDate(task.due)}</span>
                  <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  <span className={`w-16 shrink-0 text-right ${assignee ? "text-muted" : "text-danger"}`}>
                    {assignee?.name ?? "미지정"}
                  </span>
                  <span className="flex w-24 shrink-0 justify-end">
                    <StatusBadge status={task.status} />
                  </span>
                </CardRow>
              );
            })}
            {teamDue.length === 0 && <p className="py-6 text-center text-muted">이번 주 남은 마감 업무 없음</p>}
          </ul>
        </Card>
      </div>
    </>
  );
}

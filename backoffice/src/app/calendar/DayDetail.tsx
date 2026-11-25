"use client";

import { outlineButton, primaryButton } from "@/components/Button";
import { CardRow } from "@/components/Card";
import Checkbox from "@/components/Checkbox";
import { CONNECT_LATER, useToast } from "@/components/Toast";
import type { CalendarEvent, Task } from "@/lib/data/types";
import { TODAY, fullDate, timeLabel } from "@/lib/date";
import { isDone, isOverdue } from "@/lib/tasks";
import { useUser } from "@/lib/user";

type Props = {
  date: string;
  events: CalendarEvent[];
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onAddTask: () => void;
};

export default function DayDetail({ date, events, tasks, onToggleTask, onAddTask }: Props) {
  const { memberOf } = useUser();
  const toast = useToast();

  return (
    <section className="rounded-xl border border-line bg-white px-6 py-5">
      <h2 className="text-lg font-bold">
        {fullDate(date)}
        {date === TODAY && " · 오늘"}
      </h2>
      <p className="mt-1 text-muted">날짜를 누르면 해당 날짜의 일정과 업무가 표시됩니다.</p>

      <h3 className="mt-5 border-b border-line pb-2 font-bold">일정 {events.length}건</h3>
      <ul>
        {events.map((event) => (
          <CardRow key={event.id}>
            <span className="w-[72px] shrink-0 text-muted">{event.time ? timeLabel(event.time) : "종일"}</span>
            <span className="min-w-0 flex-1 truncate">{event.title}</span>
            <span className="shrink-0 text-muted">{event.ownerId === "all" ? "전체" : memberOf(event.ownerId)?.name}</span>
          </CardRow>
        ))}
      </ul>

      <h3 className="mt-5 border-b border-line pb-2 font-bold">업무 {tasks.length}건</h3>
      <ul>
        {tasks.map((task) => {
          const done = isDone(task);
          const assignee = memberOf(task.assigneeId);
          return (
            <CardRow key={task.id}>
              <Checkbox label={task.title} checked={done} onChange={() => onToggleTask(task)} />
              <span className={`min-w-0 flex-1 truncate ${done ? "text-faint line-through" : isOverdue(task) ? "text-danger" : ""}`}>
                {task.title}
              </span>
              <span className={`shrink-0 ${assignee ? "text-muted" : "text-danger"}`}>{assignee?.name ?? "미지정"}</span>
            </CardRow>
          );
        })}
      </ul>

      <div className="mt-5 space-y-2">
        <button type="button" onClick={onAddTask} className={`${primaryButton} w-full`}>
          + 업무 추가
        </button>
        <button type="button" onClick={() => toast(CONNECT_LATER.calendar)} className={`${outlineButton} w-full`}>
          구글 캘린더에 일정 추가
        </button>
      </div>
    </section>
  );
}

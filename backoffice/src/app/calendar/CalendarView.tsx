"use client";

import { useState } from "react";
import { outlineButton } from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import MemberDropdown from "@/components/MemberDropdown";
import MonthCalendar, { MonthNav } from "@/components/MonthCalendar";
import PageHeader from "@/components/PageHeader";
import { TaskCreateForm } from "@/components/TaskForm";
import ToggleGroup from "@/components/ToggleGroup";
import type { CalendarEvent, Task } from "@/lib/data/types";
import { TODAY, monthOf, timeLabel } from "@/lib/date";
import { useData, useStoreActions } from "@/lib/store";
import { isDone, isOverdue, newTaskDraft } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import DayDetail from "./DayDetail";

type Kind = "all" | "event" | "task";

const CELL_LIMIT = 3;

const byTime = (a: CalendarEvent, b: CalendarEvent) => (a.time ?? "").localeCompare(b.time ?? "");

function TaskLine({ task }: { task: Task }) {
  const done = isDone(task);
  return (
    <div className={`truncate px-1 text-sm ${done ? "text-faint line-through" : isOverdue(task) ? "text-danger" : ""}`}>
      {done ? "☑" : "☐"} {task.title}
    </div>
  );
}

function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <div className="truncate rounded bg-soft px-2 py-1 text-sm">
      {event.time && `${timeLabel(event.time)} `}
      {event.title}
    </div>
  );
}

export default function CalendarView() {
  const { user, members } = useUser();
  const { events, tasks } = useData();
  const { toggleTaskDone } = useStoreActions();
  const [month, setMonth] = useState(monthOf(TODAY));
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<Kind>("all");
  const [memberIds, setMemberIds] = useState(() => members.map((member) => member.id));
  const [hideDone, setHideDone] = useState(false);

  const everyone = memberIds.length === members.length;
  const visibleEvents =
    kind === "task" ? [] : events.filter((event) => event.ownerId === "all" || memberIds.includes(event.ownerId)).sort(byTime);
  const visibleTasks =
    kind === "event"
      ? []
      : tasks.filter(
          (task) => (task.assigneeId ? memberIds.includes(task.assigneeId) : everyone) && !(hideDone && isDone(task)),
        );

  const dayItems = (date: string) => [
    ...visibleEvents.filter((event) => event.date === date).map((event) => <EventChip key={event.id} event={event} />),
    ...visibleTasks.filter((task) => task.due === date).map((task) => <TaskLine key={task.id} task={task} />),
  ];

  // Moving to another month selects its first day; coming back to this month selects today.
  const changeMonth = (next: string) => {
    setMonth(next);
    setSelectedDate(next === monthOf(TODAY) ? TODAY : `${next}-01`);
  };

  return (
    <>
      <PageHeader
        title="캘린더"
        description="회사 일정과 업무 마감일을 한 달력에서 확인합니다."
        actions={
          <>
            <MonthNav month={month} onChange={changeMonth} />
            <button type="button" onClick={() => changeMonth(monthOf(TODAY))} className={outlineButton}>
              오늘
            </button>
          </>
        }
      />

      <div className="mb-5 rounded-xl border border-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <ToggleGroup
            label="구분"
            options={[
              { value: "all", label: "전체" },
              { value: "event", label: "일정" },
              { value: "task", label: "업무" },
            ]}
            value={kind}
            onChange={setKind}
          />
          <span className="h-6 w-px bg-line" />
          <MemberDropdown value={memberIds} onChange={setMemberIds} />
          <div className="ml-auto">
            <Checkbox label="완료된 업무 숨기기" showLabel checked={hideDone} onChange={() => setHideDone((v) => !v)} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-6 rounded bg-soft" /> 일정
          </span>
          <span>☐ 업무 (완료 시 ☑)</span>
          <span className="text-danger">빨간 글씨 = 마감 지남</span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5">
        <MonthCalendar
          month={month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          renderDay={(date) => {
            const items = dayItems(date);
            if (items.length <= CELL_LIMIT) return items;
            return [
              ...items.slice(0, CELL_LIMIT - 1),
              <div key="more" className="px-1 text-sm text-muted">
                그 외 {items.length - (CELL_LIMIT - 1)}개
              </div>,
            ];
          }}
        />
        {creating ? (
          <TaskCreateForm
            key={selectedDate}
            defaults={newTaskDraft({ status: "todo", assigneeId: user.id, due: selectedDate })}
            onCancel={() => setCreating(false)}
            onCreated={() => setCreating(false)}
          />
        ) : (
          <DayDetail
            date={selectedDate}
            events={visibleEvents.filter((event) => event.date === selectedDate)}
            tasks={visibleTasks.filter((task) => task.due === selectedDate)}
            onToggleTask={toggleTaskDone}
            onAddTask={() => setCreating(true)}
          />
        )}
      </div>
    </>
  );
}

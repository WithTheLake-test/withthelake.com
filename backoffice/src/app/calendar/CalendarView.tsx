"use client";

import { useState } from "react";
import { outlineButton } from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import MemberDropdown from "@/components/MemberDropdown";
import MonthCalendar, { MonthNav } from "@/components/MonthCalendar";
import PageHeader from "@/components/PageHeader";
import ToggleGroup from "@/components/ToggleGroup";
import type { CalendarEvent, PublishItem, Task } from "@/lib/data/types";
import { TODAY, monthOf, timeLabel } from "@/lib/date";
import { CATEGORY_SHORT, isPublished, needsPhoto } from "@/lib/publishes";
import { useData } from "@/lib/store";
import { isDone, isOverdue, matchesAssignees } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import DayDetail from "./DayDetail";

type Kind = "all" | "event" | "task" | "publish";

const CELL_LIMIT = 3;

const byTime = (a: CalendarEvent, b: CalendarEvent) => (a.time ?? "").localeCompare(b.time ?? "");

const toneOf = (faded: boolean, alert: boolean) => (faded ? "text-faint" : alert ? "text-danger" : "");

function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <div className="truncate rounded bg-soft px-2 py-1 text-sm">
      {event.time && `${timeLabel(event.time)} `}
      {event.title}
    </div>
  );
}

function TaskLine({ task }: { task: Task }) {
  return (
    <div className={`truncate px-1 text-sm ${toneOf(isDone(task), isOverdue(task))} ${isDone(task) ? "line-through" : ""}`}>
      ● {task.title}
    </div>
  );
}

function PublishChip({ item }: { item: PublishItem }) {
  return (
    <div className={`truncate rounded border border-dashed border-faint/70 px-2 py-0.5 text-sm ${toneOf(isPublished(item), needsPhoto(item))}`}>
      {CATEGORY_SHORT[item.category]} · {item.title}
    </div>
  );
}

export default function CalendarView() {
  const { members } = useUser();
  const { events, tasks, publishes } = useData();
  const [month, setMonth] = useState(monthOf(TODAY));
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [kind, setKind] = useState<Kind>("all");
  const [memberIds, setMemberIds] = useState(() => members.map((member) => member.id));
  const [hideDone, setHideDone] = useState(false);

  const everyone = memberIds.length === members.length;
  const show = (k: Kind) => kind === "all" || kind === k;
  const visibleEvents = show("event")
    ? events.filter((event) => event.ownerId === "all" || memberIds.includes(event.ownerId)).sort(byTime)
    : [];
  const visibleTasks = show("task")
    ? tasks.filter((task) => task.due && matchesAssignees(task.assigneeIds, memberIds, everyone) && !(hideDone && isDone(task)))
    : [];
  const visiblePublishes = show("publish")
    ? publishes.filter(
        (item) => item.date && matchesAssignees(item.assigneeIds, memberIds, everyone) && !(hideDone && isPublished(item)),
      )
    : [];

  const onDate = (date: string) => ({
    events: visibleEvents.filter((event) => event.date === date),
    tasks: visibleTasks.filter((task) => task.due === date),
    publishes: visiblePublishes.filter((item) => item.date === date),
  });

  // Moving to another month selects its first day; coming back to this month selects today.
  const changeMonth = (next: string) => {
    setMonth(next);
    setSelectedDate(next === monthOf(TODAY) ? TODAY : `${next}-01`);
  };

  return (
    <>
      <PageHeader
        title="캘린더"
        description="회사 일정, 업무 마감일, 발행 예정일을 한 달력에서 확인합니다."
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
              { value: "publish", label: "발행" },
            ]}
            value={kind}
            onChange={setKind}
          />
          <span className="h-6 w-px bg-line" />
          <MemberDropdown value={memberIds} onChange={setMemberIds} />
          <div className="ml-auto">
            <Checkbox label="완료된 항목 숨기기" showLabel checked={hideDone} onChange={() => setHideDone((v) => !v)} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-6 rounded bg-soft" /> 일정 (구글 캘린더)
          </span>
          <span>● 업무 마감일 (노션)</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-6 rounded border border-dashed border-faint/70" /> 발행 예정 (노션)
          </span>
          <span className="text-danger">빨간 글씨: 마감 지남, 사진 필요</span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5">
        <MonthCalendar
          month={month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          renderDay={(date) => {
            const day = onDate(date);
            const items = [
              ...day.events.map((event) => <EventChip key={event.id} event={event} />),
              ...day.tasks.map((task) => <TaskLine key={task.id} task={task} />),
              ...day.publishes.map((item) => <PublishChip key={item.id} item={item} />),
            ];
            if (items.length <= CELL_LIMIT) return items;
            return [
              ...items.slice(0, CELL_LIMIT - 1),
              <div key="more" className="px-1 text-sm text-muted">
                그 외 {items.length - (CELL_LIMIT - 1)}개
              </div>,
            ];
          }}
        />
        <DayDetail date={selectedDate} {...onDate(selectedDate)} />
      </div>
    </>
  );
}

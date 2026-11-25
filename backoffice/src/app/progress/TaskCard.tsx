"use client";

import type { Task } from "@/lib/data/types";
import { TODAY, fullDate } from "@/lib/date";
import { isDone, isOverdue } from "@/lib/tasks";
import { useUser } from "@/lib/user";

export function ImportantBadge() {
  return <span className="inline-flex rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">중요</span>;
}

export function dueSuffix(task: Task) {
  if (isOverdue(task)) return " (지남)";
  if (task.due === TODAY) return " (오늘)";
  return "";
}

type Props = {
  task: Task;
  selected: boolean;
  dragging: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

export default function TaskCard({ task, selected, dragging, onSelect, onDragStart, onDragEnd }: Props) {
  const { memberOf } = useUser();
  const assignee = memberOf(task.assigneeId);
  const done = isDone(task);

  return (
    <button
      type="button"
      draggable
      data-task={task.id}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full cursor-grab rounded-lg border-2 bg-white px-4 py-3.5 text-left active:cursor-grabbing ${
        selected ? "border-ink" : "border-transparent hover:border-line"
      } ${dragging ? "opacity-40" : ""}`}
    >
      {task.important && <ImportantBadge />}
      <p className={`mt-1.5 text-base font-bold ${done ? "text-faint line-through" : ""}`}>{task.title}</p>
      <p className="mt-2 text-muted">
        담당자 · <span className={assignee ? "" : "text-danger"}>{assignee?.name ?? "미지정"}</span>
      </p>
      <p className={`mt-0.5 ${isOverdue(task) ? "text-danger" : "text-muted"}`}>
        마감 · {fullDate(task.due)}
        {dueSuffix(task)}
      </p>
    </button>
  );
}

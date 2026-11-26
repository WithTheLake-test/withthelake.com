"use client";

import Assignees from "@/components/Assignees";
import DueLabel from "@/components/DueLabel";
import type { Task } from "@/lib/data/types";
import { useData } from "@/lib/store";
import { isDone, projectLabel } from "@/lib/tasks";

export function TaskBadges({ task }: { task: Task }) {
  return (
    <div className="flex gap-1.5">
      {task.important && <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-white">중요</span>}
      <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs text-muted">{task.kind}</span>
    </div>
  );
}

type Props = { task: Task; selected: boolean; onSelect: () => void };

export default function TaskCard({ task, selected, onSelect }: Props) {
  const { tasks } = useData();
  const done = isDone(task);

  return (
    <button
      type="button"
      data-task={task.id}
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full rounded-lg border-2 bg-white px-4 py-3.5 text-left ${
        selected ? "border-ink" : "border-transparent hover:border-line"
      }`}
    >
      <TaskBadges task={task} />
      <p className={`mt-2 text-base font-bold ${done ? "text-faint line-through" : ""}`}>{task.title}</p>
      <p className="mt-0.5 truncate text-sm text-muted">{projectLabel(task, tasks)}</p>
      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
        <Assignees ids={task.assigneeIds} muted className="min-w-0" />
        <DueLabel task={task} date="short" muted className="shrink-0" />
      </div>
    </button>
  );
}

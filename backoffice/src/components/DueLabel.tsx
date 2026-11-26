import type { Task } from "@/lib/data/types";
import { fullDate, monthDay } from "@/lib/date";
import { isOverdue, remainingLabel } from "@/lib/tasks";

type Props = { task: Task; date?: "none" | "short" | "full"; muted?: boolean; className?: string };

// "2일 지남", "11월 24일 · 2일 지남" or "11월 24일 (화) · 2일 지남"; overdue is red.
export default function DueLabel({ task, date = "none", muted = false, className = "" }: Props) {
  const dateText = task.due && date !== "none" ? (date === "full" ? fullDate(task.due) : monthDay(task.due)) : "";
  return (
    <span className={`${isOverdue(task) ? "text-danger" : muted ? "text-muted" : ""} ${className}`}>
      {dateText && `${dateText} · `}
      {remainingLabel(task)}
    </span>
  );
}

import type { TaskStatus } from "@/lib/data/types";
import { STATUS_LABEL } from "@/lib/tasks";

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className="inline-flex shrink-0 rounded-full bg-soft px-3 py-1 text-sm">{STATUS_LABEL[status]}</span>;
}

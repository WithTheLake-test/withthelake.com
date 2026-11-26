import type { PublishStatus, TaskStatus } from "@/lib/data/types";

const TONE: Partial<Record<TaskStatus | PublishStatus, string>> = {
  사진수급필요: "bg-danger/10 text-danger",
  발행완료: "bg-soft text-faint",
  완료: "bg-soft text-faint",
};

export default function StatusBadge({ status }: { status: TaskStatus | PublishStatus }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm ${TONE[status] ?? "bg-soft text-ink"}`}>{status}</span>
  );
}

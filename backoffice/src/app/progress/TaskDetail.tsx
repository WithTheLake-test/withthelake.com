"use client";

import { TaskFields } from "@/components/TaskForm";
import { CONNECT_LATER, useToast } from "@/components/Toast";
import type { Task } from "@/lib/data/types";
import { useStoreActions } from "@/lib/store";
import { ImportantBadge } from "./TaskCard";

type Props = { task?: Task; hiddenByFilter: boolean; onDeleted: () => void };

export default function TaskDetail({ task, hiddenByFilter, onDeleted }: Props) {
  const { updateTask, deleteTask } = useStoreActions();
  const toast = useToast();

  if (!task) {
    return (
      <aside className="rounded-xl border border-line bg-white px-6 py-10 text-center text-muted">
        업무 카드를 누르면 상세 내용이 표시됩니다.
      </aside>
    );
  }

  const remove = async () => {
    if (!window.confirm(`'${task.title}' 업무를 삭제합니다.`)) return;
    await deleteTask(task.id);
    onDeleted();
    toast("업무를 삭제했습니다.");
  };

  return (
    <aside className="rounded-xl border border-line bg-white px-6 py-5">
      {hiddenByFilter && (
        <p className="mb-3 rounded-lg bg-soft px-3 py-2 text-sm text-muted">필터 조건에 맞지 않아 목록에서 빠졌습니다.</p>
      )}
      <div className="mb-2 flex min-h-6 items-center justify-between">
        <span>{task.important && <ImportantBadge />}</span>
        <button type="button" onClick={() => toast(CONNECT_LATER.notion)} className="text-muted hover:text-ink">
          노션에서 보기 ↗
        </button>
      </div>
      <TaskFields key={task.id} value={task} onChange={(patch) => updateTask(task.id, patch)} />
      <div className="border-t border-line pt-4">
        <button type="button" onClick={remove} className="text-muted underline underline-offset-2 hover:text-ink">
          업무 삭제
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import { primaryButton } from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import { SelectDropdown } from "@/components/Dropdown";
import MemberDropdown from "@/components/MemberDropdown";
import PageHeader from "@/components/PageHeader";
import { TaskCreateForm } from "@/components/TaskForm";
import { TASK_STATUSES, type TaskStatus } from "@/lib/data/types";
import { TODAY, addDays } from "@/lib/date";
import { useData, useStoreActions } from "@/lib/store";
import { STATUS_LABEL, byDue, doneDate, isDone, isOverdue, newTaskDraft } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import TaskCard from "./TaskCard";
import TaskDetail from "./TaskDetail";

const COLUMN_NOTE: Partial<Record<TaskStatus, string>> = { review: "검토, 결재 대기", done: "최근 2주" };
const DONE_FROM = addDays(TODAY, -14);

type Panel = { kind: "detail"; id: string } | { kind: "create"; status: TaskStatus } | null;

// Remount per user so the assignee filter defaults to the current user.
export default function ProgressView() {
  const { user } = useUser();
  return <ProgressBoard key={user.id} />;
}

function ProgressBoard() {
  const { user } = useUser();
  const { tasks, meetings } = useData();
  const { updateTask } = useStoreActions();
  const [query, setQuery] = useState("");
  const [memberIds, setMemberIds] = useState([user.id]);
  const [meetingId, setMeetingId] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [importantOnly, setImportantOnly] = useState(false);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [draggingId, setDraggingId] = useState<string>();
  const [dropStatus, setDropStatus] = useState<TaskStatus>();

  const keyword = query.trim().toLowerCase();
  const visible = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) &&
        (unassignedOnly ? !task.assigneeId : !!task.assigneeId && memberIds.includes(task.assigneeId)) &&
        (meetingId === "all" || task.meetingId === meetingId) &&
        (!overdueOnly || isOverdue(task)) &&
        (!importantOnly || task.important) &&
        (!isDone(task) || doneDate(task) >= DONE_FROM),
    )
    .sort(byDue);
  const selected = panel?.kind === "detail" ? tasks.find((task) => task.id === panel.id) : undefined;

  const endDrag = () => {
    setDraggingId(undefined);
    setDropStatus(undefined);
  };
  const dropOn = (status: TaskStatus) => {
    const task = tasks.find((t) => t.id === draggingId);
    endDrag();
    if (task && task.status !== status) updateTask(task.id, { status });
  };

  return (
    <>
      <PageHeader
        title="진행 현황"
        description="회의에서 정한 업무의 담당자, 마감일, 진행 상태를 관리합니다."
        actions={
          <button type="button" onClick={() => setPanel({ kind: "create", status: "todo" })} className={primaryButton}>
            + 업무 추가
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="업무명 검색"
          className="h-[38px] w-56 rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
        />
        <MemberDropdown value={memberIds} onChange={setMemberIds} className="min-w-44" />
        <SelectDropdown
          label="관련 회의"
          value={meetingId}
          options={[{ value: "all", label: "전체" }, ...meetings.map((m) => ({ value: m.id, label: m.title }))]}
          onChange={setMeetingId}
          className="min-w-44"
        />
        <Checkbox label="마감 지난 업무만" showLabel checked={overdueOnly} onChange={() => setOverdueOnly((v) => !v)} />
        <Checkbox label="중요 업무만" showLabel checked={importantOnly} onChange={() => setImportantOnly((v) => !v)} />
        <Checkbox label="담당자 미지정만" showLabel checked={unassignedOnly} onChange={() => setUnassignedOnly((v) => !v)} />
      </div>

      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_300px] items-start gap-4">
        {TASK_STATUSES.map((status) => {
          const column = visible.filter((task) => task.status === status);
          return (
            <section
              key={status}
              data-column={status}
              onDragOver={(e) => {
                if (!draggingId) return;
                e.preventDefault();
                setDropStatus(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropStatus(undefined);
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropOn(status);
              }}
              className={`rounded-xl bg-soft p-3 ${dropStatus === status ? "outline-2 outline-ink" : ""}`}
            >
              <div className="mb-3 px-1">
                <h2 className="text-base font-bold">
                  {STATUS_LABEL[status]} <span className="font-normal text-muted">{column.length}</span>
                </h2>
                {COLUMN_NOTE[status] && <p className="text-sm text-muted">{COLUMN_NOTE[status]}</p>}
              </div>
              <ul className="space-y-2.5">
                {column.map((task) => (
                  <li key={task.id}>
                    <TaskCard
                      task={task}
                      selected={task.id === selected?.id}
                      dragging={task.id === draggingId}
                      onSelect={() => setPanel({ kind: "detail", id: task.id })}
                      onDragStart={() => setDraggingId(task.id)}
                      onDragEnd={endDrag}
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPanel({ kind: "create", status })}
                className="mt-3 px-1 text-muted hover:text-ink"
              >
                + 업무 추가
              </button>
            </section>
          );
        })}

        {panel?.kind === "create" ? (
          <TaskCreateForm
            key={panel.status}
            defaults={newTaskDraft({ status: panel.status, assigneeId: user.id, due: TODAY })}
            onCancel={() => setPanel(null)}
            onCreated={(task) => setPanel({ kind: "detail", id: task.id })}
          />
        ) : (
          <TaskDetail
            task={selected}
            hiddenByFilter={!!selected && !visible.some((task) => task.id === selected.id)}
            onDeleted={() => setPanel(null)}
          />
        )}
      </div>

      <p className="mt-5 rounded-xl bg-soft px-5 py-3 text-muted">
        업무 카드를 누르면 오른쪽에서 진행 상태, 담당자, 마감일을 변경할 수 있습니다. 카드를 다른 열로 끌어 놓으면 진행 상태가
        바뀝니다.
      </p>
    </>
  );
}

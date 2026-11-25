"use client";

import { useState, type ReactNode } from "react";
import { TASK_STATUSES, type NewTask, type Task } from "@/lib/data/types";
import { useData, useStoreActions } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import { outlineButton, primaryButton } from "./Button";
import Checkbox from "./Checkbox";
import { SelectDropdown } from "./Dropdown";
import { useToast } from "./Toast";

const NONE = "none";
const inputClass = "w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-ink";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-3">
      <p className="mb-1.5 text-sm text-muted">{label}</p>
      {children}
    </div>
  );
}

// Keeps its own draft while typing and saves on blur, so each keystroke does not hit storage.
function TextField({
  value,
  onCommit,
  multiline = false,
  required = false,
  placeholder,
  className = "",
}: {
  value: string;
  onCommit: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const commit = () => {
    const next = draft.trim();
    if (required && !next) return setDraft(value);
    if (next !== value) onCommit(next);
  };
  const props = {
    value: draft,
    placeholder,
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: commit,
  };
  return multiline ? (
    <textarea {...props} rows={3} className={`${inputClass} resize-y py-2 ${className}`} />
  ) : (
    <input
      {...props}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      className={`${inputClass} h-[38px] ${className}`}
    />
  );
}

type FieldsProps = { value: NewTask; onChange: (patch: Partial<NewTask>) => void };

export function TaskFields({ value, onChange }: FieldsProps) {
  const { members } = useUser();
  const { meetings } = useData();
  const subtasks = value.subtasks ?? [];
  const doneSubtasks = subtasks.filter((subtask) => subtask.done).length;

  return (
    <>
      <Field label="업무명">
        <TextField value={value.title} onCommit={(title) => onChange({ title })} required placeholder="업무명 입력" />
      </Field>
      <Field label="진행 상태">
        <SelectDropdown
          value={value.status}
          options={TASK_STATUSES.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
          onChange={(status) => onChange({ status })}
        />
      </Field>
      <Field label="담당자">
        <SelectDropdown
          value={value.assigneeId ?? NONE}
          options={[...members.map((m) => ({ value: m.id, label: m.name })), { value: NONE, label: "미지정" }]}
          onChange={(id) => onChange({ assigneeId: id === NONE ? undefined : id })}
        />
      </Field>
      <Field label="마감일">
        <input
          type="date"
          value={value.due}
          onChange={(e) => e.target.value && onChange({ due: e.target.value })}
          className={`${inputClass} h-[38px]`}
        />
      </Field>
      <Field label="중요 표시">
        <Checkbox label="중요 업무" showLabel checked={value.important} onChange={() => onChange({ important: !value.important })} />
      </Field>
      <Field label="관련 회의">
        <SelectDropdown
          value={value.meetingId ?? NONE}
          options={[{ value: NONE, label: "없음" }, ...meetings.map((m) => ({ value: m.id, label: m.title }))]}
          onChange={(id) => onChange({ meetingId: id === NONE ? undefined : id })}
        />
      </Field>
      <Field label="내용">
        <TextField value={value.description ?? ""} onCommit={(description) => onChange({ description })} multiline placeholder="내용 입력" />
      </Field>
      {subtasks.length > 0 && (
        <Field label={`세부 업무 (${subtasks.length}건 중 ${doneSubtasks}건 완료)`}>
          <ul className="space-y-2">
            {subtasks.map((subtask, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <Checkbox
                  label={subtask.title}
                  checked={subtask.done}
                  onChange={() => onChange({ subtasks: subtasks.map((s, j) => (j === i ? { ...s, done: !s.done } : s)) })}
                />
                <span className={subtask.done ? "text-faint line-through" : ""}>{subtask.title}</span>
              </li>
            ))}
          </ul>
        </Field>
      )}
    </>
  );
}

type CreateProps = { defaults: NewTask; onCancel: () => void; onCreated: (task: Task) => void };

export function TaskCreateForm({ defaults, onCancel, onCreated }: CreateProps) {
  const { addTask } = useStoreActions();
  const toast = useToast();
  const [draft, setDraft] = useState(defaults);

  const submit = async () => {
    if (!draft.title) {
      toast("업무명을 입력해 주세요.");
      return;
    }
    const task = await addTask(draft);
    toast("업무를 추가했습니다.");
    onCreated(task);
  };

  return (
    <section className="rounded-xl border border-line bg-white px-6 py-5">
      <h2 className="mb-3 text-lg font-bold">새 업무</h2>
      <TaskFields value={draft} onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))} />
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={submit} className={`${primaryButton} flex-1`}>
          추가
        </button>
        <button type="button" onClick={onCancel} className={`${outlineButton} flex-1`}>
          취소
        </button>
      </div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";
import Assignees from "@/components/Assignees";
import { primaryButton } from "@/components/Button";
import DueLabel from "@/components/DueLabel";
import ExternalLink from "@/components/ExternalLink";
import type { Task } from "@/lib/data/types";
import { fullDate } from "@/lib/date";
import { useData } from "@/lib/store";
import { byDue, isDone } from "@/lib/tasks";
import { TaskBadges } from "./TaskCard";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-line py-3">
      <span className="w-20 shrink-0 text-sm text-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function TaskDetail({ task }: { task?: Task }) {
  const { tasks } = useData();

  if (!task) {
    return (
      <aside className="rounded-xl border border-line bg-white px-6 py-10 text-center text-muted">
        업무 카드를 누르면 상세 내용이 표시됩니다.
      </aside>
    );
  }

  const parent = tasks.find((t) => t.id === task.parentId);
  // The project's own sub-tasks, or the sub-tasks this task belongs with.
  const projectId = parent?.id ?? (tasks.some((t) => t.parentId === task.id) ? task.id : undefined);
  const siblings = projectId ? tasks.filter((t) => t.parentId === projectId).sort(byDue) : [];

  return (
    <aside className="rounded-xl border border-line bg-white px-6 py-5">
      <TaskBadges task={task} />
      <h2 className="mt-2 mb-4 text-lg font-bold">{task.title}</h2>

      <Row label="진행상태">{task.status}</Row>
      <Row label="담당자">
        <Assignees ids={task.assigneeIds} className="block" />
      </Row>
      <Row label="목표일정">
        {task.start && task.due && task.start !== task.due && <span>{fullDate(task.start)} ~ </span>}
        <DueLabel task={task} date="full" />
      </Row>
      <Row label="프로젝트">{parent?.title ?? (projectId ? task.title : "없음")}</Row>
      <Row label="카테고리">{task.category}</Row>
      {task.meetingTitle && <Row label="회의록">{task.meetingTitle}</Row>}
      {task.partner && <Row label="주관·파트너">{task.partner}</Row>}
      {task.memo && <Row label="메모">{task.memo}</Row>}

      {siblings.length > 0 && (
        <div className="border-t border-line pt-3">
          <p className="mb-2 text-sm text-muted">
            같은 프로젝트 업무 ({siblings.length}건 중 {siblings.filter(isDone).length}건 완료)
          </p>
          <ul className="space-y-1.5">
            {siblings.map((t) => (
              <li key={t.id} className={`flex gap-3 ${isDone(t) ? "text-faint" : ""}`}>
                <span className="w-12 shrink-0 text-sm">{t.status}</span>
                <span className={`min-w-0 flex-1 truncate ${t.id === task.id ? "font-bold" : ""}`}>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ExternalLink href={task.notionUrl} className={`${primaryButton} mt-5 w-full`}>
        노션에서 열기
      </ExternalLink>
    </aside>
  );
}

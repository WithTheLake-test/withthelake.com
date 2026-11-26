"use client";

import { useState } from "react";
import { outlineButton } from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import { SelectDropdown } from "@/components/Dropdown";
import ExternalLink from "@/components/ExternalLink";
import MemberDropdown from "@/components/MemberDropdown";
import PageHeader from "@/components/PageHeader";
import { TASK_CATEGORIES, TASK_KINDS, TASK_STATUSES, type TaskStatus } from "@/lib/data/types";
import { NOTION_TASKS_URL } from "@/lib/links";
import { useData } from "@/lib/store";
import { byDue, isDone, isOverdue, matchesAssignees, recentlyDone } from "@/lib/tasks";
import { useUser } from "@/lib/user";
import TaskCard from "./TaskCard";
import TaskDetail from "./TaskDetail";

const COLUMN_NOTE: Record<TaskStatus, string> = { 준비: "시작 전", 진행중: "진행 중인 업무", 완료: "최근 2주" };
const ALL = "all";

const withAll = (values: readonly string[]) => [{ value: ALL, label: "전체" }, ...values.map((value) => ({ value, label: value }))];

export default function ProgressView() {
  const { members } = useUser();
  const { tasks } = useData();
  const [query, setQuery] = useState("");
  const [memberIds, setMemberIds] = useState(() => members.map((member) => member.id));
  const [category, setCategory] = useState(ALL);
  const [projectId, setProjectId] = useState(ALL);
  const [kind, setKind] = useState(ALL);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [importantOnly, setImportantOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();

  const projects = tasks.filter((task) => tasks.some((t) => t.parentId === task.id));
  const everyone = memberIds.length === members.length;
  const keyword = query.trim().toLowerCase();
  const visible = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) &&
        matchesAssignees(task.assigneeIds, memberIds, everyone) &&
        (category === ALL || task.category === category) &&
        (projectId === ALL || task.id === projectId || task.parentId === projectId) &&
        (kind === ALL || task.kind === kind) &&
        (!overdueOnly || isOverdue(task)) &&
        (!importantOnly || task.important) &&
        (!isDone(task) || recentlyDone(task, 14)),
    )
    .sort(byDue);
  const selected = tasks.find((task) => task.id === selectedId);

  return (
    <>
      <PageHeader
        title="진행 현황"
        description="노션 업무 표의 진행 상태를 담당자, 마감일 기준으로 확인합니다."
        actions={
          <ExternalLink href={NOTION_TASKS_URL} className={outlineButton}>
            노션에서 업무 추가
          </ExternalLink>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="업무명 검색"
          className="h-[38px] w-52 rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
        />
        <MemberDropdown value={memberIds} onChange={setMemberIds} />
        <SelectDropdown label="카테고리" value={category} options={withAll(TASK_CATEGORIES)} onChange={setCategory} />
        <SelectDropdown
          label="프로젝트"
          value={projectId}
          options={[{ value: ALL, label: "전체" }, ...projects.map((p) => ({ value: p.id, label: p.title }))]}
          onChange={setProjectId}
        />
        <SelectDropdown label="구분" value={kind} options={withAll(TASK_KINDS)} onChange={setKind} />
        <Checkbox label="마감 지난 업무만" showLabel checked={overdueOnly} onChange={() => setOverdueOnly((v) => !v)} />
        <Checkbox label="중요 업무만" showLabel checked={importantOnly} onChange={() => setImportantOnly((v) => !v)} />
      </div>

      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_340px] items-start gap-4">
        {TASK_STATUSES.map((status) => {
          const column = visible.filter((task) => task.status === status);
          return (
            <section key={status} data-column={status} className="rounded-xl bg-soft p-3">
              <div className="mb-3 px-1">
                <h2 className="text-base font-bold">
                  {status} <span className="font-normal text-muted">{column.length}</span>
                </h2>
                <p className="text-sm text-muted">{COLUMN_NOTE[status]}</p>
              </div>
              <ul className="space-y-2.5">
                {column.map((task) => (
                  <li key={task.id}>
                    <TaskCard task={task} selected={task.id === selectedId} onSelect={() => setSelectedId(task.id)} />
                  </li>
                ))}
              </ul>
              {column.length === 0 && <p className="px-1 py-4 text-sm text-muted">해당 업무 없음</p>}
            </section>
          );
        })}
        <TaskDetail task={selected} />
      </div>

      <p className="mt-5 rounded-xl bg-soft px-5 py-3 text-muted">
        이 화면은 확인용입니다. 업무 추가와 수정은 노션에서 하고, 바꾼 내용은 몇 분 안에 반영됩니다. 바로 확인하려면 상단 새로고침을
        누르세요.
      </p>
    </>
  );
}

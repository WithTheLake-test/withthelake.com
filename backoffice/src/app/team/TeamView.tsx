"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import { SelectDropdown } from "@/components/Dropdown";
import MemberDropdown from "@/components/MemberDropdown";
import PageHeader from "@/components/PageHeader";
import Segmented from "@/components/Segmented";
import { TASK_STATUSES, type Task } from "@/lib/data/types";
import { TODAY, addDays, endOfMonth, fullDate, monthOf, startOfWeek } from "@/lib/date";
import { useData } from "@/lib/store";
import { byDue, dueWithin, isOverdue, projectLabel } from "@/lib/tasks";
import { useUser } from "@/lib/user";

type Period = "week" | "last" | "month";

const PERIOD_LABEL: Record<Period, string> = { week: "이번 주", last: "지난주", month: "이번 달" };
const OVERDUE = "마감 지남";

function periodRange(period: Period): [string, string] {
  const weekStart = startOfWeek(TODAY);
  if (period === "week") return [weekStart, addDays(weekStart, 6)];
  if (period === "last") return [addDays(weekStart, -7), addDays(weekStart, -1)];
  const month = monthOf(TODAY);
  return [`${month}-01`, endOfMonth(month)];
}

function Stat({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${alert ? "text-danger" : ""}`}>
        {value}
        <span className="text-base font-normal">건</span>
      </p>
    </div>
  );
}

export default function TeamView() {
  const { members, memberOf } = useUser();
  const { tasks } = useData();
  const [period, setPeriod] = useState<Period>("week");
  const [memberIds, setMemberIds] = useState(() => members.map((member) => member.id));
  const [state, setState] = useState("all");

  const [start, end] = periodRange(period);
  const label = PERIOD_LABEL[period];
  const dueInPeriod = tasks.filter((task) => dueWithin(task, start, end));
  const listed = tasks.filter((task) => dueWithin(task, start, end) || isOverdue(task)).sort(byDue);

  // One row per assignee, since a task with several assignees counts for each of them.
  const rows = listed
    .flatMap((task) => (task.assigneeIds.length ? task.assigneeIds : [""]).map((assigneeId) => ({ task, assigneeId })))
    .filter(({ assigneeId }) => (assigneeId ? memberIds.includes(assigneeId) : memberIds.length === members.length))
    .filter(({ task }) => state === "all" || (state === OVERDUE ? isOverdue(task) : task.status === state));

  return (
    <>
      <PageHeader
        title="팀 현황"
        description="담당자별 업무 현황입니다. 한 업무에 담당자가 여러 명이면 각 담당자에게 모두 포함됩니다."
        actions={
          <Segmented
            options={(Object.keys(PERIOD_LABEL) as Period[]).map((value) => ({ value, label: PERIOD_LABEL[value] }))}
            value={period}
            onChange={setPeriod}
          />
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-5">
        {members.map((member) => {
          const own = (list: Task[]) => list.filter((task) => task.assigneeIds.includes(member.id));
          const overdue = own(tasks).filter(isOverdue).length;
          return (
            <Card key={member.id}>
              <div className="flex items-center gap-3">
                <Avatar label={member.short} size="lg" />
                <div>
                  <p className="text-base font-bold">{member.name}</p>
                  <p className="text-muted">{member.role}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="진행 중" value={own(tasks).filter((task) => task.status === "진행중").length} />
                <Stat label={`${label} 마감`} value={own(dueInPeriod).length} />
                <Stat label="마감 지남" value={overdue} alert={overdue > 0} />
              </div>
            </Card>
          );
        })}
      </div>

      <section className="rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold">{label} 마감·마감 지난 업무</h2>
          <div className="flex gap-2">
            <MemberDropdown value={memberIds} onChange={setMemberIds} />
            <SelectDropdown
              label="진행상태"
              value={state}
              options={[
                { value: "all", label: "전체" },
                ...TASK_STATUSES.map((value) => ({ value, label: value })),
                { value: OVERDUE, label: OVERDUE },
              ]}
              onChange={setState}
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-muted">
            <tr className="border-t border-line">
              <th className="w-[12%] px-6 py-3 font-normal">담당자</th>
              <th className="px-6 py-3 font-normal">업무</th>
              <th className="w-[24%] px-6 py-3 font-normal">프로젝트·카테고리</th>
              <th className="w-[15%] px-6 py-3 font-normal">마감일</th>
              <th className="w-[16%] px-6 py-3 font-normal">진행상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ task, assigneeId }) => (
              <tr key={`${task.id}-${assigneeId}`} className="border-t border-line">
                <td className={`px-6 py-3.5 ${assigneeId ? "" : "text-danger"}`}>{memberOf(assigneeId)?.name ?? "미지정"}</td>
                <td className="px-6 py-3.5">{task.title}</td>
                <td className="px-6 py-3.5 text-muted">{projectLabel(task, tasks)}</td>
                <td className="px-6 py-3.5 text-muted">{task.due && fullDate(task.due)}</td>
                <td className={`px-6 py-3.5 ${isOverdue(task) ? "text-danger" : ""}`}>
                  {task.status}
                  {isOverdue(task) && ` · ${OVERDUE}`}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="border-t border-line">
                <td colSpan={5} className="px-6 py-10 text-center text-muted">
                  해당 업무 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

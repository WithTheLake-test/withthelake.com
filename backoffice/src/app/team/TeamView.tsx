"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";
import Card from "@/components/Card";
import { SelectDropdown } from "@/components/Dropdown";
import MemberDropdown from "@/components/MemberDropdown";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ProgressBar";
import Segmented from "@/components/Segmented";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/data/types";
import { TODAY, addDays, dateRange, endOfMonth, isoWeek, monthDay, monthOf, startOfWeek } from "@/lib/date";
import { useData } from "@/lib/store";
import { STATUS_LABEL, byDue, doneDate, isDone, isOverdue } from "@/lib/tasks";
import { useUser } from "@/lib/user";

type Period = "week" | "last" | "month";
type StateFilter = "all" | TaskStatus | "overdue";

const PERIOD_LABEL: Record<Period, string> = { week: "이번 주", last: "지난주", month: "이번 달" };

function periodRange(period: Period): [string, string] {
  const weekStart = startOfWeek(TODAY);
  if (period === "week") return [weekStart, addDays(weekStart, 6)];
  if (period === "last") return [addDays(weekStart, -7), addDays(weekStart, -1)];
  const month = monthOf(TODAY);
  return [`${month}-01`, endOfMonth(month)];
}

const stateLabel = (task: Task) => (isOverdue(task) ? "마감 지남" : STATUS_LABEL[task.status]);

export default function TeamView() {
  const { members, memberOf } = useUser();
  const { tasks, goals } = useData();
  const [period, setPeriod] = useState<Period>("week");
  const [memberIds, setMemberIds] = useState(() => members.map((member) => member.id));
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");

  const [start, end] = periodRange(period);
  const inRange = (date: string) => date >= start && date <= end;
  // Earlier tasks count when finished in this period, or (for current periods) while still overdue.
  const inPeriod = tasks.filter(
    (task) =>
      inRange(task.due) ||
      (task.due < start && (isDone(task) ? inRange(doneDate(task)) : period !== "last" && isOverdue(task))),
  );
  const everyone = memberIds.length === members.length;
  const rows = inPeriod
    .filter(
      (task) =>
        (task.assigneeId ? memberIds.includes(task.assigneeId) : everyone) &&
        (stateFilter === "all" || (stateFilter === "overdue" ? isOverdue(task) : task.status === stateFilter)),
    )
    .sort(byDue);

  return (
    <>
      <PageHeader
        title="팀 현황"
        description={`${PERIOD_LABEL[period]}(${dateRange(start, end)}) 담당자별 업무 완료 현황입니다.`}
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
          const own = inPeriod.filter((task) => task.assigneeId === member.id);
          const done = own.filter((task) => task.status === "done").length;
          const overdue = own.filter(isOverdue).length;
          const ratio = own.length ? done / own.length : 0;
          const [firstGoal, ...restGoals] = goals.filter(
            (goal) => goal.week === isoWeek(period === "last" ? addDays(TODAY, -7) : TODAY) && goal.ownerId === member.id,
          );

          return (
            <Card key={member.id}>
              <div className="flex items-center gap-3">
                <Avatar label={member.short} size="lg" />
                <div>
                  <p className="text-base font-bold">{member.name}</p>
                  <p className="text-muted">{member.role}</p>
                </div>
              </div>
              <p className="mt-4 text-muted">{PERIOD_LABEL[period]} 업무</p>
              <p className="mt-1 text-2xl font-bold">
                {own.length}건 중 {done}건 완료 <span className="text-base font-normal text-muted">({Math.round(ratio * 100)}%)</span>
              </p>
              <div className="mt-3">
                <ProgressBar value={ratio} />
              </div>
              <p className={`mt-3 ${overdue > 0 ? "text-danger" : "text-muted"}`}>
                {overdue > 0 ? `마감 지난 업무 ${overdue}건` : "마감 지난 업무 없음"}
              </p>
              <p className="mt-3 truncate border-t border-line pt-3 text-muted">
                팀 목표 · {firstGoal ? `${firstGoal.title}${restGoals.length ? ` 외 ${restGoals.length}건` : ""}` : "없음"}
              </p>
            </Card>
          );
        })}
      </div>

      <section className="rounded-xl border border-line bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold">{PERIOD_LABEL[period]} 업무 목록</h2>
          <div className="flex gap-2">
            <MemberDropdown value={memberIds} onChange={setMemberIds} className="min-w-44" />
            <SelectDropdown
              label="상태"
              value={stateFilter}
              options={[
                { value: "all", label: "전체" },
                ...TASK_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
                { value: "overdue", label: "마감 지남" },
              ]}
              onChange={setStateFilter}
              className="min-w-40"
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-muted">
            <tr className="border-t border-line">
              <th className="w-[22%] px-6 py-3 font-normal">담당자</th>
              <th className="px-6 py-3 font-normal">업무</th>
              <th className="w-[18%] px-6 py-3 font-normal">마감일</th>
              <th className="w-[16%] px-6 py-3 font-normal">상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => {
              const assignee = memberOf(task.assigneeId);
              return (
                <tr key={task.id} className="border-t border-line">
                  <td className="px-6 py-3.5">
                    {assignee ? (
                      <span className="flex items-center gap-2">
                        <Avatar label={assignee.short} />
                        {assignee.name}
                      </span>
                    ) : (
                      <span className="text-danger">미지정</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">{task.title}</td>
                  <td className="px-6 py-3.5 text-muted">{monthDay(task.due)}</td>
                  <td className={`px-6 py-3.5 ${isOverdue(task) ? "text-danger" : ""}`}>{stateLabel(task)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr className="border-t border-line">
                <td colSpan={4} className="px-6 py-10 text-center text-muted">
                  해당하는 업무 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

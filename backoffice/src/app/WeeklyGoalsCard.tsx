"use client";

import Card, { CardRow } from "@/components/Card";
import Checkbox from "@/components/Checkbox";
import ProgressBar from "@/components/ProgressBar";
import type { WeeklyGoal } from "@/lib/data/types";
import { useStoreActions } from "@/lib/store";
import { useUser } from "@/lib/user";

export default function WeeklyGoalsCard({ goals }: { goals: WeeklyGoal[] }) {
  const { memberOf } = useUser();
  const { setGoalDone } = useStoreActions();
  const doneCount = goals.filter((goal) => goal.done).length;

  return (
    <Card title="이번 주 팀 목표" action={`${goals.length}건 중 ${doneCount}건 달성`}>
      <div className="pt-4 pb-1">
        <ProgressBar value={goals.length ? doneCount / goals.length : 0} />
      </div>
      <ul>
        {goals.map((goal) => (
          <CardRow key={goal.id}>
            <Checkbox
              label={goal.title}
              checked={goal.done}
              onChange={() => setGoalDone(goal.id, !goal.done)}
            />
            <span className={`min-w-0 flex-1 truncate ${goal.done ? "text-faint line-through" : ""}`}>{goal.title}</span>
            <span className="shrink-0 text-muted">{memberOf(goal.ownerId)?.name}</span>
          </CardRow>
        ))}
      </ul>
    </Card>
  );
}

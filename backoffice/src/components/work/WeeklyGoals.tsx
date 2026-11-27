"use client";

import { useState } from "react";
import Checkbox from "@/components/Checkbox";
import { endOfWeek, startOfWeek } from "@/lib/date";
import { cardClass } from "./ui";

type Goal = { id: number; title: string; owners: string; done: boolean };

// Example goals until a real store is chosen; checking and adding only change this screen.
const EXAMPLE: Goal[] = [
  { id: 1, title: "강원초기창업 IR 발표 준비", owners: "정미경", done: true },
  { id: 2, title: "MG 함께자람 결과보고서 완성", owners: "정미경 · 김민주", done: false },
  { id: 3, title: "시니어박람회 PR 기사 발행", owners: "김민주", done: false },
];

const short = (day: string) => `${Number(day.slice(5, 7))}/${Number(day.slice(8))}`;

export default function WeeklyGoals({ today, me }: { today: string; me?: string }) {
  const [goals, setGoals] = useState(EXAMPLE);
  const [draft, setDraft] = useState("");
  const done = goals.filter((g) => g.done).length;

  const add = () => {
    if (!draft.trim()) return;
    setGoals((prev) => [...prev, { id: Date.now(), title: draft.trim(), owners: me ?? "", done: false }]);
    setDraft("");
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">
          공동 주간목표 <span className="ml-1 rounded bg-soft px-1.5 py-0.5 text-xs font-normal text-muted">예시</span>
        </h3>
        <span className="text-sm text-muted">
          {short(startOfWeek(today))} – {short(endOfWeek(today))}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold">
          {goals.length}개 중 {done}개 달성
        </span>
        <span className="text-muted">{goals.length ? Math.round((done / goals.length) * 100) : 0}%</span>
      </div>
      <ul className="mt-3 space-y-3">
        {goals.map((g) => (
          <li key={g.id} className="flex items-start gap-3">
            <Checkbox label={g.title} checked={g.done} onChange={() => setGoals((prev) => prev.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))} />
            <div>
              <p className={g.done ? "text-faint line-through" : ""}>{g.title}</p>
              {g.owners && <p className="text-sm text-muted">{g.owners}</p>}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="+ 목표 추가 (Enter)"
          className="h-[38px] flex-1 rounded-lg border border-line px-3 outline-none focus:border-ink"
        />
        <button type="button" onClick={add} className="h-[38px] rounded-lg border border-line px-4 hover:bg-soft">
          추가
        </button>
      </div>
    </div>
  );
}

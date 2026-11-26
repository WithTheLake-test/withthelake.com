"use client";

import { useState } from "react";
import { monthDay } from "@/lib/date";
import { SALES_GROUPS, salesLate } from "@/lib/work/rules";
import type { SalesItem } from "@/lib/work/types";
import { Section, cardClass } from "./ui";

// Shown only when the Notion sales table is empty and "예시 데이터로 보기" is on.
const EXAMPLE: SalesItem[] = [
  { id: "ex1", name: "A복지관", url: "#", stage: "제안서 보내야 함", nextAction: "견적서 정리", owners: ["정미경"] },
  { id: "ex2", name: "B요양원", url: "#", stage: "제안서 보냄", proposalSent: "2026-11-10", owners: ["김민주"] },
  { id: "ex3", name: "C경로당", url: "#", stage: "미팅", nextAction: "현장 방문", owners: ["정미경"] },
  { id: "ex4", name: "D기관", url: "#", stage: "성사", amount: 3_000_000, owners: ["김민주"] },
];

export default function Sales({ items, today }: { items: SalesItem[]; today: string }) {
  const [example, setExample] = useState(false);
  const empty = items.length === 0;
  const shown = empty && example ? EXAMPLE : items;

  return (
    <Section
      title="6 · 영업 활동"
      note={
        empty && (
          <button type="button" onClick={() => setExample((v) => !v)} className="rounded-full border border-line bg-white px-3 py-1 hover:bg-soft">
            {example ? "예시 데이터 숨기기" : "예시 데이터로 보기"}
          </button>
        )
      }
    >
      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-white px-5 py-5 text-muted">
          노션 💼 영업활동 DB가 아직 비어 있습니다. 업체를 추가하면 단계별(제안서 보내야 함 / 보냄·회신 대기 / 리드·컨택·미팅 / 성사)로 여기에 정리됩니다.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {SALES_GROUPS.map((group) => {
            const list = shown.filter((s) => group.stages.includes(s.stage));
            return (
              <div key={group.label} className="rounded-xl bg-soft p-3">
                <p className="mb-2 px-1 font-bold">
                  {group.label} <span className="font-normal text-muted">{list.length}</span>
                </p>
                <ul className="space-y-2">
                  {list.map((s) => {
                    const late = salesLate(s, today);
                    return (
                      <li key={s.id}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className={`${cardClass} block !px-3.5 !py-3 ${late ? "border-red-200" : ""}`}>
                          <p className="font-semibold">{s.name}</p>
                          <p className="mt-1 text-sm text-muted">
                            {s.stage}
                            {s.owners.length > 0 && ` · ${s.owners.join(", ")}`}
                          </p>
                          {s.proposalSent && <p className={`text-sm ${late && s.stage === "제안서 보냄" ? "text-danger" : "text-muted"}`}>제안서 발송 {monthDay(s.proposalSent)}</p>}
                          {(s.nextAction || s.nextActionDate) && (
                            <p className={`text-sm ${s.nextActionDate && s.nextActionDate < today ? "text-danger" : "text-muted"}`}>
                              다음 액션 {s.nextActionDate ? monthDay(s.nextActionDate) : ""} {s.nextAction ?? ""}
                            </p>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

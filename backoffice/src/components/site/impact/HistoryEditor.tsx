"use client";

import { dangerButton, primaryButton } from "@/components/Button";
import { inputClass } from "../Field";
import SortableList from "../SortableList";
import { AddRowButton, RemoveButton } from "../StringListInput";

export type HistoryYear = { year: string; items: { month: string; text: string }[] };

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

// History grouped by year; years and their entries can both be reordered by the handle.
export default function HistoryEditor({ value, onChange }: { value: HistoryYear[]; onChange: (v: HistoryYear[]) => void }) {
  const update = (i: number, year: HistoryYear) => onChange(value.map((y, j) => (j === i ? year : y)));
  const updateItem = (i: number, k: number, patch: Partial<HistoryYear["items"][number]>) =>
    update(i, { ...value[i], items: value[i].items.map((it, j) => (j === k ? { ...it, ...patch } : it)) });

  const addYear = () => {
    const last = Number(value.at(-1)?.year);
    onChange([...value, { year: Number.isFinite(last) ? String(last + 1) : "", items: [{ month: "", text: "" }] }]);
  };

  return (
    <section>
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={addYear} className={primaryButton}>
          + 연도 추가
        </button>
      </div>
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(_, i) => String(i)}
        className="space-y-4"
        renderItem={(year, i, handle) => (
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="flex items-center gap-3 border-b border-line bg-canvas px-4 py-3">
              {handle}
              <input
                value={year.year}
                onChange={(e) => update(i, { ...year, year: e.target.value })}
                className="w-16 rounded-md border border-transparent bg-transparent px-1 text-xl font-bold outline-none hover:border-line focus:border-ink focus:bg-white"
                aria-label="연도"
              />
              <span className="text-muted">년 · {year.items.length}건</span>
              <button
                type="button"
                className={`${dangerButton} ml-auto`}
                onClick={() => window.confirm(`${year.year}년 연혁을 모두 삭제합니다.`) && onChange(value.filter((_, j) => j !== i))}
              >
                연도 삭제
              </button>
            </div>
            <SortableList
              items={year.items}
              onChange={(items) => update(i, { ...year, items })}
              getKey={(_, k) => String(k)}
              renderItem={(item, k, itemHandle) => (
                <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
                  {itemHandle}
                  <select
                    value={item.month}
                    onChange={(e) => updateItem(i, k, { month: e.target.value })}
                    className={`h-[38px] w-28 shrink-0 rounded-lg border border-line bg-white px-3 outline-none focus:border-ink ${item.month ? "" : "text-faint"}`}
                    aria-label="월"
                  >
                    <option value="">월 선택</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                  <input value={item.text} onChange={(e) => updateItem(i, k, { text: e.target.value })} className={`${inputClass} h-[38px]`} aria-label="내용" />
                  <RemoveButton onClick={() => update(i, { ...year, items: year.items.filter((_, j) => j !== k) })} />
                </div>
              )}
            />
            <AddRowButton onClick={() => update(i, { ...year, items: [...year.items, { month: "", text: "" }] })}>내용 추가</AddRowButton>
          </div>
        )}
      />
    </section>
  );
}

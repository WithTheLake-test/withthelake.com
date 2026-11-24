"use client";

import SortableList from "../SortableList";
import { Button, Select, TextInput } from "../ui";

export type HistoryYear = { year: string; items: { month: string; text: string }[] };

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

/** 연혁: 연도별로 묶어 편집합니다. 연도와 내용 모두 손잡이로 순서를 바꿀 수 있습니다. */
export default function HistoryEditor({ value, onChange }: { value: HistoryYear[]; onChange: (v: HistoryYear[]) => void }) {
  const update = (i: number, year: HistoryYear) => onChange(value.map((y, j) => (j === i ? year : y)));

  function addYear() {
    const last = Number(value.at(-1)?.year);
    onChange([...value, { year: Number.isFinite(last) ? String(last + 1) : "", items: [{ month: "", text: "" }] }]);
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-[15px] font-bold text-slate-900">연도별 내용</h3>
        <Button size="sm" variant="primary" onClick={addYear}>
          + 연도 추가
        </Button>
      </div>
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(_, i) => String(i)}
        className="space-y-3"
        renderItem={(year, i, handle) => (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              {handle}
              <input
                value={year.year}
                onChange={(e) => update(i, { ...year, year: e.target.value })}
                className="w-20 rounded-md border border-transparent bg-transparent px-1 text-[18px] font-bold text-primary outline-none hover:border-slate-200 focus:border-primary focus:bg-white"
                aria-label="연도"
              />
              <span className="text-[13px] text-slate-400">{year.items.length}건</span>
              <Button
                size="sm"
                variant="danger"
                className="ml-auto"
                onClick={() => window.confirm(`${year.year}년 연혁을 모두 삭제할까요?`) && onChange(value.filter((_, j) => j !== i))}
              >
                연도 삭제
              </Button>
            </div>
            <SortableList
              items={year.items}
              onChange={(items) => update(i, { ...year, items })}
              getKey={(_, k) => String(k)}
              renderItem={(item, k, itemHandle) => (
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2">
                  {itemHandle}
                  <Select
                    value={item.month}
                    onChange={(e) => update(i, { ...year, items: year.items.map((it, j) => (j === k ? { ...it, month: e.target.value } : it)) })}
                    className="!h-9 !w-24"
                    aria-label="월"
                  >
                    <option value="">월 없음</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </Select>
                  <TextInput
                    value={item.text}
                    onChange={(e) => update(i, { ...year, items: year.items.map((it, j) => (j === k ? { ...it, text: e.target.value } : it)) })}
                    className="!h-9"
                    aria-label="내용"
                  />
                  <button
                    type="button"
                    onClick={() => update(i, { ...year, items: year.items.filter((_, j) => j !== k) })}
                    className="px-2 text-[18px] text-slate-400 hover:text-red-600"
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </div>
              )}
            />
            <button type="button" onClick={() => update(i, { ...year, items: [...year.items, { month: "", text: "" }] })} className="px-4 py-2.5 text-[13px] font-semibold text-primary">
              + 내용 추가
            </button>
          </div>
        )}
      />
    </section>
  );
}

"use client";

import SortableList from "./SortableList";
import { TextInput } from "./ui";

/** 문자열 목록 편집: 순서 변경, 추가, 삭제 */
export default function StringListInput({ value, onChange, addLabel = "항목 추가", placeholder }: { value: string[]; onChange: (v: string[]) => void; addLabel?: string; placeholder?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(_, i) => String(i)}
        renderItem={(item, i, handle) => (
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            {handle}
            <TextInput value={item} placeholder={placeholder} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} className="!h-9" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-2 text-[18px] text-slate-400 hover:text-red-600" aria-label="삭제">
              ×
            </button>
          </div>
        )}
      />
      <button type="button" onClick={() => onChange([...value, ""])} className="w-full bg-slate-50/60 px-4 py-2.5 text-left text-[13px] font-semibold text-primary hover:bg-primary-light">
        + {addLabel}
      </button>
    </div>
  );
}

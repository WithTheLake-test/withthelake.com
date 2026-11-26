"use client";

import { inputClass } from "./Field";
import SortableList from "./SortableList";

export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="px-2 text-lg text-faint hover:text-danger" aria-label="삭제">
      ×
    </button>
  );
}

export function AddRowButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="w-full px-4 py-3 text-left font-semibold hover:bg-soft">
      + {children}
    </button>
  );
}

// List of strings: reorder, add, delete.
export default function StringListInput({ value, onChange, addLabel }: { value: string[]; onChange: (v: string[]) => void; addLabel: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(_, i) => String(i)}
        renderItem={(item, i, handle) => (
          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            {handle}
            <input value={item} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} className={`${inputClass} h-9`} />
            <RemoveButton onClick={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        )}
      />
      <AddRowButton onClick={() => onChange([...value, ""])}>{addLabel}</AddRowButton>
    </div>
  );
}

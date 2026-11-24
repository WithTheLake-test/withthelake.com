"use client";

import { useRef } from "react";
import type { FieldDef } from "@/lib/admin/impact-schema";
import { useUploads } from "@/lib/admin/uploads";
import AdminImage from "./AdminImage";
import ImageInput from "./ImageInput";
import SortableList from "./SortableList";
import StringListInput from "./StringListInput";
import { Field, TextArea, TextInput } from "./ui";

/** 설정(FieldDef)의 type 에 맞는 입력칸을 그립니다. */
export default function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  return (
    <Field label={field.label} required={field.required} hint={field.hint}>
      <Control field={field} value={value} onChange={onChange} />
    </Field>
  );
}

function Control({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "textarea":
      return <TextArea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <TextInput type="number" value={String(value ?? "")} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />;
    case "image":
      return <ImageInput value={String(value ?? "")} onChange={onChange} />;
    case "images":
      return <ImageListInput value={(value as string[]) ?? []} onChange={onChange} />;
    case "strings":
      return <StringListInput value={(value as string[]) ?? []} onChange={onChange} addLabel={`${field.label} 추가`} />;
    default:
      return <TextInput value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}

/** 필수 입력이 비어 있으면 안내 문구를 돌려줍니다. */
export function missingField(fields: FieldDef[], item: Record<string, unknown>) {
  const empty = fields.find((f) => f.required && (item[f.key] === undefined || String(item[f.key]).trim() === ""));
  return empty ? `${empty.label}을(를) 입력해 주세요.` : "";
}

function ImageListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { add } = useUploads();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(src, i) => `${src}-${i}`}
        renderItem={(src, i, handle) => (
          <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2">
            {handle}
            <AdminImage src={src} className="h-12 w-[72px] rounded-md" />
            <span className="flex-1 truncate text-[12px] text-slate-400">{src}</span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-2 text-[18px] text-slate-400 hover:text-red-600" aria-label="삭제">
              ×
            </button>
          </div>
        )}
      />
      <button type="button" onClick={() => inputRef.current?.click()} className="w-full bg-slate-50/60 px-4 py-2.5 text-left text-[13px] font-semibold text-primary hover:bg-primary-light">
        + 사진 추가
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onChange([...value, await add(file)]);
        }}
      />
    </div>
  );
}

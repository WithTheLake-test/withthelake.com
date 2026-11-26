"use client";

import { useRef } from "react";
import type { FieldDef } from "@/lib/site/impact-schema";
import { useUploads } from "@/lib/site/uploads";
import { Field, inputClass } from "./Field";
import ImageInput from "./ImageInput";
import SiteImage from "./SiteImage";
import SortableList from "./SortableList";
import StringListInput, { AddRowButton, RemoveButton } from "./StringListInput";

// Draws the input that matches the field type in the impact schema.
export default function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  return (
    <Field label={field.label} required={field.required} hint={field.hint}>
      <Control field={field} value={value} onChange={onChange} />
    </Field>
  );
}

function Control({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const text = String(value ?? "");
  switch (field.type) {
    case "textarea":
      return <textarea aria-label={field.label} value={text} rows={3} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-y py-2`} />;
    case "number":
      return (
        <input
          aria-label={field.label}
          type="number"
          value={text}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={`${inputClass} h-[38px]`}
        />
      );
    case "image":
      return <ImageInput value={text} onChange={onChange} />;
    case "images":
      return <ImageListInput value={(value as string[]) ?? []} onChange={onChange} />;
    case "strings":
      return <StringListInput value={(value as string[]) ?? []} onChange={onChange} addLabel={`${field.label} 추가`} />;
    default:
      return <input aria-label={field.label} value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} h-[38px]`} />;
  }
}

// Returns a notice when a required field is empty.
export function missingField(fields: FieldDef[], item: Record<string, unknown>) {
  const empty = fields.find((f) => f.required && String(item[f.key] ?? "").trim() === "");
  return empty ? `${empty.label}을(를) 입력해 주세요.` : "";
}

function ImageListInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { add } = useUploads();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <SortableList
        items={value}
        onChange={onChange}
        getKey={(src, i) => `${src}-${i}`}
        renderItem={(src, i, handle) => (
          <div className="flex items-center gap-3 border-b border-line px-3 py-2">
            {handle}
            <SiteImage src={src} className="h-12 w-[72px] rounded-md" />
            <span className="flex-1 truncate text-sm text-muted">{src}</span>
            <RemoveButton onClick={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        )}
      />
      <AddRowButton onClick={() => inputRef.current?.click()}>사진 추가</AddRowButton>
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

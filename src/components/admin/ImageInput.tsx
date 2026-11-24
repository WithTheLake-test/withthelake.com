"use client";

import { useRef, useState } from "react";
import { useUploads } from "@/lib/admin/uploads";
import AdminImage from "./AdminImage";
import { Button } from "./ui";

/** 이미지 한 장 선택. value 는 사이트 경로(/uploads/...)입니다. */
export default function ImageInput({ value, onChange, height = "h-44" }: { value: string; onChange: (src: string) => void; height?: string }) {
  const { add } = useUploads();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    try {
      setError("");
      onChange(await add(file));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {value ? (
        <AdminImage src={value} className={`block w-full ${height}`} />
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className={`flex w-full items-center justify-center bg-slate-50 text-[13px] text-slate-400 ${height}`}>
          + 이미지 선택
        </button>
      )}
      <div className="flex items-center gap-2 p-2.5">
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          {value ? "이미지 변경" : "이미지 선택"}
        </Button>
        {value && (
          <Button size="sm" onClick={() => onChange("")}>
            삭제
          </Button>
        )}
        {error && <span className="text-[12px] text-red-600">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

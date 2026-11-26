"use client";

import { useRef, useState } from "react";
import { outlineButton } from "@/components/Button";
import { useUploads } from "@/lib/site/uploads";
import SiteImage from "./SiteImage";

// One image. The value is a site path (/uploads/...); new files are previewed in the browser until saved.
export default function ImageInput({ value, onChange, height = "h-44" }: { value: string; onChange: (src: string) => void; height?: string }) {
  const { add } = useUploads();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    try {
      setError("");
      onChange(await add(file));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div>
      {value ? (
        <SiteImage src={value} className={`block w-full rounded-lg ${height}`} />
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className={`flex w-full items-center justify-center rounded-lg bg-soft text-muted ${height}`}>
          + 이미지 선택
        </button>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} className={outlineButton}>
          {value ? "이미지 변경" : "이미지 선택"}
        </button>
        {error && <span className="text-sm text-danger">{error}</span>}
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

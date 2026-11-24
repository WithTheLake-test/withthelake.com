"use client";

import { useMemo, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { useUploads } from "@/lib/admin/uploads";

type Tool = { label: string; apply: (selected: string) => string };

const TOOLS: Tool[] = [
  { label: "소제목", apply: (s) => `\n## ${s || "소제목"}\n` },
  { label: "굵게", apply: (s) => `**${s || "굵은 글씨"}**` },
  { label: "목록", apply: (s) => `\n${(s || "항목").split("\n").map((l) => `- ${l}`).join("\n")}\n` },
  { label: "인용", apply: (s) => `\n> ${s || "인용 문구"}\n` },
  { label: "링크", apply: (s) => `[${s || "링크 문구"}](https://)` },
];

/** 마크다운 본문 편집기: 툴바로 문법을 넣고, 옆에서 실제 화면처럼 미리 봅니다. */
export default function MarkdownEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { add, resolve } = useUploads();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(true);
  const [error, setError] = useState("");

  function insert(make: (selected: string) => string) {
    const el = areaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const text = make(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  async function insertImage(file?: File) {
    if (!file) return;
    try {
      setError("");
      const src = await add(file);
      insert(() => `\n![사진 설명](${src})\n`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const html = useMemo(
    () => (preview ? renderMarkdown(value).replace(/src="(\/uploads\/[^"]+)"/g, (_, src: string) => `src="${resolve(src)}"`) : ""),
    [preview, value, resolve],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-slate-300 bg-slate-50 p-2">
        {TOOLS.map((t) => (
          <button key={t.label} type="button" onClick={() => insert(t.apply)} className="h-8 rounded-md px-2.5 text-[13px] font-semibold text-slate-700 hover:bg-white">
            {t.label}
          </button>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} className="h-8 rounded-md px-2.5 text-[13px] font-semibold text-slate-700 hover:bg-white">
          이미지
        </button>
        {error && <span className="text-[12px] text-red-600">{error}</span>}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className={`ml-auto h-8 rounded-md border px-3 text-[13px] font-semibold ${preview ? "border-primary/30 bg-primary-light text-primary" : "border-slate-200 bg-white text-slate-600"}`}
        >
          미리보기 {preview ? "끄기" : "켜기"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void insertImage(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <div className={`grid min-h-[520px] rounded-b-lg border border-slate-300 ${preview ? "grid-cols-2" : "grid-cols-1"}`}>
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[520px] resize-y rounded-bl-lg p-4 font-mono text-[13px] leading-[1.9] text-slate-800 outline-none"
          placeholder="본문을 입력하세요. 툴바 버튼으로 소제목, 목록, 이미지 등을 넣을 수 있습니다."
        />
        {preview && (
          <div className="overflow-auto border-l border-slate-200 px-5 py-4">
            <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-400">미리보기</p>
            <div className="story-body !text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </div>
  );
}

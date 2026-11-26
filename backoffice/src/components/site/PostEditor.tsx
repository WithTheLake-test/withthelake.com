"use client";

import { useRef, useState } from "react";
import Checkbox from "@/components/Checkbox";
import { textToBody } from "@/lib/site/body";
import { useUploads } from "@/lib/site/uploads";
import StoryPreview from "./StoryPreview";

type Tool = { label: string; apply: (selected: string) => string };

const lines = (selected: string, fallback: string, mark: (i: number) => string) =>
  (selected || fallback)
    .split("\n")
    .map((line, i) => `${mark(i)}${line}`)
    .join("\n");

const TOOLS: Tool[] = [
  { label: "소제목", apply: (s) => `\n\n## ${s || "소제목"}\n\n` },
  { label: "굵게", apply: (s) => `**${s || "굵은 글씨"}**` },
  { label: "링크", apply: (s) => `[${s || "링크 문구"}](https://)` },
  { label: "목록", apply: (s) => `\n\n${lines(s, "항목", () => "- ")}\n\n` },
  { label: "번호 목록", apply: (s) => `\n\n${lines(s, "항목", (i) => `${i + 1}. `)}\n\n` },
];

// Body editor: the toolbar inserts the markup, and the preview uses the homepage rules.
export default function PostEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { add } = useUploads();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(true);
  const [error, setError] = useState("");

  const insert = (make: (selected: string) => string) => {
    const el = areaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const text = make(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const insertImage = async (file?: File) => {
    if (!file) return;
    try {
      setError("");
      const src = await add(file);
      insert(() => `\n\n![사진 설명](${src})\n\n`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="flex items-center gap-1 border-b border-line bg-canvas px-3 py-2">
        {TOOLS.map((tool) => (
          <button key={tool.label} type="button" onClick={() => insert(tool.apply)} className="rounded-md px-3 py-1.5 font-semibold hover:bg-soft">
            {tool.label}
          </button>
        ))}
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md px-3 py-1.5 font-semibold hover:bg-soft">
          사진 넣기
        </button>
        {error && <span className="ml-2 text-sm text-danger">{error}</span>}
        <div className="ml-auto text-sm text-muted">
          <Checkbox label="미리보기 함께 보기" showLabel checked={preview} onChange={() => setPreview((v) => !v)} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void insertImage(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className={`grid ${preview ? "grid-cols-2" : "grid-cols-1"}`}>
        <textarea
          ref={areaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="본문"
          className="min-h-[560px] resize-y p-5 font-mono text-[15px] leading-[1.9] outline-none"
        />
        {preview && (
          <div className="min-w-0 border-l border-line p-5">
            <p className="mb-3 text-sm text-muted">미리보기 · 홈페이지와 같은 모양</p>
            <StoryPreview body={textToBody(value)} />
          </div>
        )}
      </div>
    </div>
  );
}

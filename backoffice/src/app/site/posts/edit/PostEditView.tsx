"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { dangerButton, outlineButton, primaryButton } from "@/components/Button";
import Card from "@/components/Card";
import Checkbox from "@/components/Checkbox";
import { SelectDropdown } from "@/components/Dropdown";
import { Field, inputClass } from "@/components/site/Field";
import ImageInput from "@/components/site/ImageInput";
import PostEditor from "@/components/site/PostEditor";
import { useToast } from "@/components/Toast";
import type { Story } from "@/generated/site-types";
import { bodyToText, textToBody } from "@/lib/site/body";
import { SAVE_LATER, loadSiteData } from "@/lib/site/data";
import { sameValue } from "@/lib/site/path";
import { UploadsProvider } from "@/lib/site/uploads";
import { useUnsavedWarning } from "@/lib/site/useUnsavedWarning";

type Draft = Omit<Story, "body"> & { bodyText: string };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function todayDot() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function PostEditView() {
  return (
    <UploadsProvider>
      <PostEditForm />
    </UploadsProvider>
  );
}

function PostEditForm() {
  const slug = useSearchParams().get("slug");
  const toast = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [original, setOriginal] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    loadSiteData().then(({ story }) => {
      const post = slug ? story.items.find((p) => p.slug === slug) : undefined;
      if (slug && !post) return setMissing(true);
      const initial: Draft = post
        ? { ...post, featured: !!post.featured, bodyText: bodyToText(post.body) }
        : { slug: "", category: story.categories[0], title: "", date: todayDot(), image: "", excerpt: "", featured: false, bodyText: "" };
      setCategories(story.categories);
      setOriginal(initial);
      setDraft(initial);
    });
  }, [slug]);

  const dirty = !!draft && !!original && !sameValue(draft, original);
  useUnsavedWarning(dirty);

  if (missing) {
    return (
      <p className="py-20 text-center text-muted">
        해당 글을 찾을 수 없습니다.{" "}
        <Link href="/site/posts" className="underline">
          목록으로
        </Link>
      </p>
    );
  }
  if (!draft) return <p className="py-20 text-center text-muted">불러오는 중</p>;

  const set = (patch: Partial<Draft>) => setDraft((d) => d && { ...d, ...patch });
  const slugError = draft.slug && !SLUG.test(draft.slug) ? "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다." : "";

  const save = () => {
    if (!draft.title.trim() || !draft.slug || slugError || textToBody(draft.bodyText).length === 0) {
      toast("제목, 글 주소, 본문을 확인해 주세요.");
      return;
    }
    toast(SAVE_LATER);
  };
  const remove = () => {
    if (window.confirm(`'${draft.title}' 글을 삭제합니다.`)) toast(SAVE_LATER);
  };

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-bold">{slug ? "글 수정" : "새 글 쓰기"}</h1>
          <p className="mt-1.5 text-base text-muted">저장하면 1~2분 뒤 홈페이지에 반영됩니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/site/posts" className={outlineButton}>
            취소
          </Link>
          <button type="button" onClick={save} className={primaryButton}>
            저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5">
        <Card className="space-y-5">
          <Field label="제목" required>
            <input aria-label="제목" value={draft.title} onChange={(e) => set({ title: e.target.value })} className={`${inputClass} h-[42px]`} />
          </Field>
          <Field label="요약" hint="목록 카드와 검색 결과 설명에 표시됩니다.">
            <input aria-label="요약" value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={`${inputClass} h-[42px]`} />
          </Field>
          <Field label="본문" required>
            <PostEditor value={draft.bodyText} onChange={(bodyText) => set({ bodyText })} />
          </Field>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-5">
            <Field label="카테고리">
              <SelectDropdown value={draft.category} options={categories.map((c) => ({ value: c, label: c }))} onChange={(category) => set({ category })} className="w-full" />
            </Field>
            <Field label="날짜" hint="2026.10.12 형식으로 입력합니다.">
              <input aria-label="날짜" value={draft.date} onChange={(e) => set({ date: e.target.value })} className={`${inputClass} h-[42px]`} />
            </Field>
            <Field label="글 주소" hint={slugError || "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다."}>
              <div className={`flex h-[42px] items-center rounded-lg border bg-white px-3 ${slugError ? "border-danger" : "border-line focus-within:border-ink"}`}>
                <span className="text-muted">/story/</span>
                <input aria-label="글 주소" value={draft.slug} onChange={(e) => set({ slug: e.target.value.trim() })} className="min-w-0 flex-1 outline-none" />
              </div>
            </Field>
          </Card>

          <Card>
            <Field label="대표 이미지" hint="목록 카드와 글 상단에 표시됩니다. 가로형 사진을 권장합니다.">
              <ImageInput value={draft.image} onChange={(image) => set({ image })} />
            </Field>
          </Card>

          <Card>
            <Checkbox label="홈 노출" showLabel checked={!!draft.featured} onChange={() => set({ featured: !draft.featured })} />
            <p className="mt-2 pl-7 text-sm text-muted">홈페이지 첫 화면 STORY 영역에 이 글을 보여 줍니다.</p>
          </Card>

          {slug && (
            <Card className="flex items-center justify-between">
              <span className="text-muted">이 글을 삭제합니다</span>
              <button type="button" onClick={remove} className={dangerButton}>
                글 삭제
              </button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

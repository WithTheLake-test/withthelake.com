"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { ApiError, notifySaved, siteApi } from "@/lib/site/client";
import { OFFLINE_NOTICE, loadSiteData, type SiteData } from "@/lib/site/data";
import { sameValue } from "@/lib/site/path";
import { UploadsProvider, useUploads } from "@/lib/site/uploads";
import { useUnsavedWarning } from "@/lib/site/useUnsavedWarning";
import { featuredNotice, validatePost, type Issues } from "@/lib/site/validate";

type Draft = Omit<Story, "body"> & { bodyText: string };

const toDraft = (post: Story): Draft => ({ ...post, featured: !!post.featured, bodyText: bodyToText(post.body) });
// An untouched body keeps its stored blocks exactly, so saving other fields never rewrites the body.
const toPost = ({ bodyText, ...rest }: Draft, base: Story): Story => ({
  ...rest,
  body: bodyText === bodyToText(base.body) ? base.body : textToBody(bodyText),
});

export default function PostEditView() {
  return (
    <UploadsProvider>
      <PostEditForm />
    </UploadsProvider>
  );
}

type Loaded = { base: Story; items: Story[]; categories: string[]; live: boolean };

function PostEditForm() {
  const slug = useSearchParams().get("slug");
  const router = useRouter();
  const toast = useToast();
  const uploads = useUploads();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [missing, setMissing] = useState(false);
  const [issues, setIssues] = useState<Issues>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = useCallback(({ story, live }: SiteData, target: string | null) => {
    const post = target ? story.items.find((p) => p.slug === target) : undefined;
    if (!post) return setMissing(true);
    setLoaded({ base: post, items: story.items, categories: story.categories, live });
    setDraft(toDraft(post));
    setIssues({});
  }, []);
  const load = async (target: string | null) => apply(await loadSiteData(), target);

  useEffect(() => {
    loadSiteData().then((data) => apply(data, slug));
  }, [slug, apply]);

  const dirty = !!draft && !!loaded && !sameValue(draft, toDraft(loaded.base));
  useUnsavedWarning(dirty);

  if (missing) {
    return (
      <p className="py-20 text-center text-muted">
        수정할 글을 찾을 수 없습니다. 새 글은 자동 발행으로만 올라옵니다.{" "}
        <Link href="/site/posts" className="underline">
          목록으로
        </Link>
      </p>
    );
  }
  if (!draft || !loaded) return <p className="py-20 text-center text-muted">불러오는 중</p>;

  const set = (patch: Partial<Draft>) => setDraft((d) => d && { ...d, ...patch });
  const others = loaded.items.filter((p) => p.slug !== loaded.base.slug);
  const homeNotice = featuredNotice(loaded.items.map((p) => (p.slug === loaded.base.slug ? toPost(draft, loaded.base) : p)));

  const save = async () => {
    const post = toPost(draft, loaded.base);
    const found = validatePost(post, others, loaded.categories);
    setIssues(found);
    if (Object.keys(found).length) return toast("빨간색으로 표시된 칸을 확인해 주세요.");
    if (post.slug !== loaded.base.slug && !window.confirm(`글 주소를 바꾸면 예전 주소 /story/${loaded.base.slug}는 404가 됩니다. 저장합니다.`)) return;
    setBusy(true);
    setNotice("");
    try {
      const { commit } = await siteApi<{ commit: string | null }>("post", { method: "PUT", body: { base: loaded.base, post, uploads: uploads.list() } });
      uploads.clear();
      toast(commit ? "저장했습니다. 1~2분 뒤 홈페이지에 반영됩니다." : "바뀐 내용이 없습니다.");
      notifySaved();
      if (post.slug !== loaded.base.slug) router.replace(`/site/posts/edit?slug=${encodeURIComponent(post.slug)}`);
      else await load(post.slug);
    } catch (e) {
      setNotice((e as Error).message);
      if (!(e instanceof ApiError && e.conflict)) toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`'${loaded.base.title}' 글을 삭제합니다. 홈페이지에서도 사라집니다.`)) return;
    setBusy(true);
    try {
      await siteApi("post", { method: "DELETE", body: { base: loaded.base } });
      notifySaved();
      toast("삭제했습니다. 1~2분 뒤 홈페이지에 반영됩니다.");
      router.replace("/site/posts");
    } catch (e) {
      setNotice((e as Error).message);
      setBusy(false);
    }
  };

  const disabled = busy || !loaded.live;

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-bold">글 수정</h1>
          <p className="mt-1.5 text-base text-muted">저장하면 1~2분 뒤 홈페이지에 반영됩니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/site/posts" className={outlineButton}>
            취소
          </Link>
          <button type="button" onClick={save} disabled={disabled} className={`${primaryButton} disabled:opacity-40`}>
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {!loaded.live && <p className="mb-4 rounded-xl bg-soft px-5 py-3 text-muted">{OFFLINE_NOTICE}</p>}
      {notice && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-danger/40 bg-white px-5 py-3 text-danger">
          <span>{notice}</span>
          <button type="button" onClick={() => window.location.reload()} className={outlineButton}>
            최신 내용 불러오기
          </button>
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-5">
        <Card className="space-y-5">
          <Field label="제목" required error={issues.title}>
            <input aria-label="제목" aria-invalid={!!issues.title} value={draft.title} onChange={(e) => set({ title: e.target.value })} className={`${inputClass} h-[42px]`} />
          </Field>
          <Field label="요약" required hint="목록 카드와 검색 결과 설명에 표시됩니다." error={issues.excerpt}>
            <input aria-label="요약" aria-invalid={!!issues.excerpt} value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={`${inputClass} h-[42px]`} />
          </Field>
          <Field label="본문" required error={issues.body}>
            <PostEditor value={draft.bodyText} onChange={(bodyText) => set({ bodyText })} />
          </Field>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-5">
            <Field label="카테고리" error={issues.category}>
              <SelectDropdown value={draft.category} options={loaded.categories.map((c) => ({ value: c, label: c }))} onChange={(category) => set({ category })} className="w-full" />
            </Field>
            <Field label="날짜" hint="2026.10.12 형식으로 입력합니다." error={issues.date}>
              <input aria-label="날짜" aria-invalid={!!issues.date} value={draft.date} onChange={(e) => set({ date: e.target.value })} className={`${inputClass} h-[42px]`} />
            </Field>
            <Field label="글 주소" hint="영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다. 바꾸면 예전 주소는 404가 됩니다." error={issues.slug}>
              <div className={`flex h-[42px] items-center rounded-lg border bg-white px-3 ${issues.slug ? "border-danger" : "border-line focus-within:border-ink"}`}>
                <span className="text-muted">/story/</span>
                <input aria-label="글 주소" value={draft.slug} onChange={(e) => set({ slug: e.target.value.trim() })} className="min-w-0 flex-1 outline-none" />
              </div>
            </Field>
          </Card>

          <Card className={issues.image ? "border-danger" : ""}>
            <Field label="대표 이미지" required hint="목록 카드와 글 상단에 표시됩니다. 가로형 사진을 권장합니다." error={issues.image}>
              <ImageInput value={draft.image} onChange={(image) => set({ image })} />
            </Field>
          </Card>

          <Card>
            <Checkbox label="홈 노출" showLabel checked={!!draft.featured} onChange={() => set({ featured: !draft.featured })} />
            <p className="mt-2 pl-7 text-sm text-muted">홈페이지 첫 화면 STORY 영역에 보여 줍니다. 홈에는 홈 노출 글 중 앞의 3개만 보입니다.</p>
            <p className="mt-2 pl-7 text-sm text-ink">{homeNotice}</p>
          </Card>

          <Card className="flex items-center justify-between">
            <span className="text-muted">이 글을 삭제합니다</span>
            <button type="button" onClick={remove} disabled={disabled} className={`${dangerButton} disabled:opacity-40`}>
              글 삭제
            </button>
          </Card>
        </div>
      </div>
    </>
  );
}

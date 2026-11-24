"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Story } from "@/lib/cms/types";
import { DATE_PATTERN, SLUG_PATTERN } from "@/lib/cms/story-file";
import { adminApi, today } from "@/lib/admin/client";
import { UploadsProvider, useUploads } from "@/lib/admin/uploads";
import { useUnsavedWarning } from "@/lib/admin/useUnsavedWarning";
import AdminShell from "@/components/admin/AdminShell";
import DeployStatus from "@/components/admin/DeployStatus";
import ImageInput from "@/components/admin/ImageInput";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { Button, Card, Field, Loading, Notice, PageHeading, Select, TextArea, TextInput } from "@/components/admin/ui";

const EMPTY: Story = { slug: "", title: "", category: "", date: "", image: "", excerpt: "", body: "", featured: false };

export default function PostEditPage() {
  return (
    <UploadsProvider>
      <Suspense>
        <PostEditor />
      </Suspense>
    </UploadsProvider>
  );
}

type Loaded = { categories: string[]; post?: Story; sha?: string };

function PostEditor() {
  const slug = useSearchParams().get("slug");
  const router = useRouter();
  const uploads = useUploads();

  const [categories, setCategories] = useState<string[] | null>(null);
  const [saved, setSaved] = useState<{ post: Story; sha?: string; slug?: string }>({ post: EMPTY });
  const [post, setPost] = useState<Story>(EMPTY);
  const [status, setStatus] = useState<{ error?: string; busy?: boolean; commit?: string }>({});

  useEffect(() => {
    adminApi<Loaded>(`post${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`).then(
      (d) => {
        const loaded = d.post ?? { ...EMPTY, date: today() };
        setCategories(d.categories);
        setSaved({ post: loaded, sha: d.sha, slug: d.post?.slug });
        setPost(loaded);
      },
      (e: Error) => setStatus({ error: e.message }),
    );
  }, [slug]);

  const isNew = !saved.slug;
  const dirty = JSON.stringify(post) !== JSON.stringify(saved.post);
  useUnsavedWarning(dirty);

  const set = <K extends keyof Story>(key: K, value: Story[K]) => setPost((p) => ({ ...p, [key]: value }));

  async function save() {
    setStatus({ busy: true });
    try {
      const res = await adminApi<{ commit: string; sha: string }>("post", {
        method: "PUT",
        body: { post, originalSlug: saved.slug, sha: saved.sha, uploads: uploads.list() },
      });
      uploads.clear();
      setSaved({ post, sha: res.sha, slug: post.slug });
      setStatus({ commit: res.commit });
      if (post.slug !== slug) router.replace(`/admin/posts/edit?slug=${post.slug}`);
    } catch (e) {
      setStatus({ error: (e as Error).message });
    }
  }

  async function remove() {
    if (!window.confirm(`'${saved.post.title}' 글을 삭제할까요? 사이트에서도 사라집니다.`)) return;
    setStatus({ busy: true });
    try {
      await adminApi("post", { method: "DELETE", body: { slug: saved.slug, sha: saved.sha, title: saved.post.title } });
      router.push("/admin/posts");
    } catch (e) {
      setStatus({ error: (e as Error).message });
    }
  }

  function cancel() {
    if (dirty && !window.confirm("저장하지 않은 내용이 사라집니다. 목록으로 돌아갈까요?")) return;
    router.push("/admin/posts");
  }

  const title = isNew ? "새 글 쓰기" : "글 수정";
  return (
    <AdminShell
      crumbs={["게시물", title]}
      actions={
        <>
          {status.commit && !dirty && <DeployStatus commit={status.commit} />}
          <Button onClick={cancel}>취소</Button>
          <Button variant="primary" onClick={save} disabled={!categories || status.busy || (!dirty && !isNew)}>
            {status.busy ? "저장 중…" : "저장"}
          </Button>
        </>
      }
    >
      <PageHeading title={title} desc="저장하면 1~3분 뒤 사이트에 반영됩니다." />
      {status.error && <div className="mt-5"><Notice>{status.error}</Notice></div>}
      {!categories ? (
        !status.error && <Loading />
      ) : (
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="divide-y divide-slate-100">
            <div className="space-y-4 p-6">
              <Field label="제목" required>
                <TextInput value={post.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="요약" required hint="목록 카드와 글 상단, 검색 결과 설명에 표시됩니다.">
                <TextArea rows={2} value={post.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
              </Field>
            </div>
            <div className="p-6">
              <p className="mb-1.5 text-[13px] font-semibold text-slate-700">
                본문<span className="ml-0.5 text-red-600">*</span>
              </p>
              <MarkdownEditor value={post.body} onChange={(v) => set("body", v)} />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="space-y-4 p-5">
              <Field label="카테고리" required>
                <Select value={post.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">선택</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="날짜" required hint={post.date && !DATE_PATTERN.test(post.date) ? "2026.11.24 형식으로 입력해 주세요." : undefined}>
                <TextInput value={post.date} placeholder="2026.11.24" onChange={(e) => set("date", e.target.value)} />
              </Field>
              <Field label="글 주소" required hint={post.slug && !SLUG_PATTERN.test(post.slug) ? "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다." : "예: barefoot-walking-guide · 영문 소문자, 숫자, 하이픈(-)"}>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white pl-3 focus-within:border-primary">
                  <span className="shrink-0 whitespace-nowrap text-slate-400">/story/</span>
                  <input value={post.slug} onChange={(e) => set("slug", e.target.value.trim().toLowerCase())} className="h-10 w-full rounded-lg pr-3 text-[14px] outline-none" />
                </div>
              </Field>
            </Card>
            <Card className="p-5">
              <Field label="대표 이미지" required hint="가로형 사진을 권장합니다. 목록 카드와 글 상단에 표시됩니다.">
                <ImageInput value={post.image} onChange={(v) => set("image", v)} />
              </Field>
            </Card>
            <Card className="p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={!!post.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-0.5 h-[18px] w-[18px] accent-primary" />
                <span>
                  <span className="block font-semibold">HOME에 노출</span>
                  <span className="mt-0.5 block text-[12px] text-slate-400">메인 페이지 STORY 영역에 보입니다. 체크한 글이 3개보다 적으면 최신 글로 채워집니다.</span>
                </span>
              </label>
            </Card>
            {!isNew && (
              <Card className="flex items-center justify-between p-5">
                <span className="text-[13px] text-slate-500">이 글을 삭제합니다</span>
                <Button variant="danger" size="sm" onClick={remove} disabled={status.busy}>
                  글 삭제
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

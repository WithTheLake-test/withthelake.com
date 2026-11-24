"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Story } from "@/lib/cms/types";
import { adminApi } from "@/lib/admin/client";
import { UploadsProvider } from "@/lib/admin/uploads";
import AdminShell from "@/components/admin/AdminShell";
import AdminImage from "@/components/admin/AdminImage";
import CategoryBadge from "@/components/admin/CategoryBadge";
import DeployStatus from "@/components/admin/DeployStatus";
import { ButtonLink, Card, Loading, Notice, PageHeading } from "@/components/admin/ui";

const ALL = "전체";

export default function PostsPage() {
  const [data, setData] = useState<{ posts: Story[]; categories: string[] } | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(ALL);

  useEffect(() => {
    adminApi<{ posts: Story[]; categories: string[] }>("posts").then(setData, (e: Error) => setError(e.message));
  }, []);

  const posts = useMemo(() => (data?.posts ?? []).filter((p) => active === ALL || p.category === active), [data, active]);
  const count = (c: string) => (c === ALL ? data?.posts.length : data?.posts.filter((p) => p.category === c).length) ?? 0;

  return (
    <UploadsProvider>
      <AdminShell crumbs={["게시물"]} actions={<DeployStatus />}>
        <PageHeading
          title="게시물"
          desc="STORY 페이지에 보이는 글을 관리합니다. 저장하면 1~3분 뒤 사이트에 반영됩니다."
          actions={
            <ButtonLink href="/admin/posts/edit" variant="primary">
              + 새 글 쓰기
            </ButtonLink>
          }
        />
        {error && <div className="mt-6"><Notice>{error}</Notice></div>}
        {!data && !error && <Loading />}
        {data && (
          <>
            <div role="tablist" className="mt-6 flex flex-wrap gap-1.5">
              {[ALL, ...data.categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={active === c}
                  onClick={() => setActive(c)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold ${
                    active === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {c}
                  <span className={active === c ? "text-white/60" : "text-slate-400"}>{count(c)}</span>
                </button>
              ))}
            </div>
            <Card className="mt-4 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-[12px] font-semibold text-slate-500">
                    <th className="w-[104px] px-4 py-3">대표 이미지</th>
                    <th className="px-4 py-3">제목</th>
                    <th className="w-[140px] px-4 py-3">카테고리</th>
                    <th className="w-[120px] px-4 py-3">날짜</th>
                    <th className="w-[110px] px-4 py-3">HOME 노출</th>
                    <th className="w-[90px] px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.slug} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <AdminImage src={p.image} className="block h-12 w-[72px] rounded-md" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/posts/edit?slug=${p.slug}`} className="text-[15px] font-semibold hover:text-primary">
                          {p.title}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-slate-400">/story/{p.slug}</p>
                      </td>
                      <td className="px-4 py-3">
                        <CategoryBadge category={p.category} categories={data.categories} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.date}</td>
                      <td className="px-4 py-3 text-[13px]">{p.featured ? <span className="font-semibold text-primary">● 노출</span> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <ButtonLink href={`/admin/posts/edit?slug=${p.slug}`} size="sm">
                          수정
                        </ButtonLink>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        글이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </AdminShell>
    </UploadsProvider>
  );
}

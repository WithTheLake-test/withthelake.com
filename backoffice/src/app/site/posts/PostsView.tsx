"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { outlineButton, primaryButton } from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SiteImage from "@/components/site/SiteImage";
import ToggleGroup from "@/components/ToggleGroup";
import type { StoryContent } from "@/generated/site-types";
import { loadSiteData } from "@/lib/site/data";
import { UploadsProvider } from "@/lib/site/uploads";

const ALL = "all";

export default function PostsView() {
  const [story, setStory] = useState<StoryContent | null>(null);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadSiteData().then((data) => setStory(data.story));
  }, []);

  if (!story) return <p className="py-20 text-center text-muted">불러오는 중</p>;

  const keyword = query.trim().toLowerCase();
  const posts = [...story.items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((post) => (category === ALL || post.category === category) && post.title.toLowerCase().includes(keyword));
  const countOf = (c: string) => story.items.filter((post) => post.category === c).length;

  return (
    <UploadsProvider>
      <PageHeader
        title="게시물 (STORY)"
        description="홈페이지 STORY 메뉴에 보이는 글을 관리합니다. 저장하면 1~2분 뒤 홈페이지에 반영됩니다."
        actions={
          <Link href="/site/posts/edit" className={primaryButton}>
            + 새 글 쓰기
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-4">
        <ToggleGroup
          options={[
            { value: ALL, label: "전체", count: story.items.length },
            ...story.categories.map((c) => ({ value: c, label: c, count: countOf(c) })),
          ]}
          value={category}
          onChange={setCategory}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 검색"
          className="h-[38px] w-60 rounded-lg border border-line bg-white px-3 outline-none focus:border-ink"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <table className="w-full text-left">
          <thead className="text-muted">
            <tr>
              <th className="w-36 px-6 py-3 font-normal">대표 이미지</th>
              <th className="px-4 py-3 font-normal">제목</th>
              <th className="w-36 px-4 py-3 font-normal">카테고리</th>
              <th className="w-32 px-4 py-3 font-normal">날짜</th>
              <th className="w-24 px-4 py-3 font-normal">홈 노출</th>
              <th className="w-28 px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug} data-post={post.slug} className="border-t border-line">
                <td className="px-6 py-3">
                  <SiteImage src={post.image} className="h-16 w-24 rounded-md" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">{post.title}</p>
                  <p className="mt-0.5 text-sm text-muted">/story/{post.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-soft px-3 py-1 text-sm">{post.category}</span>
                </td>
                <td className="px-4 py-3 text-muted">{post.date}</td>
                <td className="px-4 py-3">{post.featured ? <strong>노출</strong> : <span className="text-faint">-</span>}</td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/site/posts/edit?slug=${encodeURIComponent(post.slug)}`} className={outlineButton}>
                    수정
                  </Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr className="border-t border-line">
                <td colSpan={6} className="px-6 py-10 text-center text-muted">
                  해당하는 글 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="mt-5 rounded-xl bg-soft px-5 py-3 text-muted">
        자동 발행으로 올라온 글도 이 목록에 함께 표시됩니다. &apos;홈 노출&apos;을 켠 글은 홈페이지 첫 화면 STORY 영역에 보입니다.
      </p>
    </UploadsProvider>
  );
}

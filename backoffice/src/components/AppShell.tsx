"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HOMEPAGE_URL } from "@/lib/links";
import { useReload } from "@/lib/store";
import { useUser } from "@/lib/user";
import Avatar from "./Avatar";
import { outlineButton } from "./Button";
import ExternalLink from "./ExternalLink";
import DeployStatus from "./site/DeployStatus";
import { useToast } from "./Toast";

const MENU = [
  {
    title: "업무",
    items: [
      { label: "홈", href: "/" },
      { label: "캘린더", href: "/calendar" },
      { label: "진행 현황", href: "/progress" },
      { label: "팀 현황", href: "/team" },
    ],
  },
  {
    title: "홈페이지 관리",
    items: [
      { label: "게시물 (STORY)", href: "/site/posts" },
      { label: "성과 (IMPACT)", href: "/site/impact" },
    ],
  },
];

const UPCOMING_MENU = "영업, 경영지원, 메일 공유, 설정";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

function UserSelect() {
  const { user, members, setUser } = useUser();
  return (
    <label className="relative flex h-[42px] items-center gap-2 rounded-lg border border-line bg-white px-3">
      <span className="text-muted">사용자</span>
      <Avatar label={user.short} />
      <span className="font-semibold">{user.name}</span>
      <span className="text-xs">▾</span>
      <select
        aria-label="사용자"
        value={user.id}
        onChange={(e) => setUser(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const toast = useToast();
  const { loadedAt, reload } = useReload();

  const refresh = async () => {
    await reload();
    toast("최신 내용을 불러왔습니다.");
  };

  return (
    <div className="flex min-h-screen min-w-[1280px]">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-line bg-white px-3.5 py-6">
        <Link href="/" className="mb-7 px-2.5">
          <p className="text-base font-extrabold tracking-wide">WITH THE LAKE</p>
          <p className="mt-0.5 text-sm text-muted">업무 관리</p>
        </Link>
        <nav className="flex-1 space-y-6">
          {MENU.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-3 text-sm font-semibold text-muted">{group.title}</p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex h-[46px] items-center rounded-lg px-3 text-base ${
                        isActive(pathname, item.href) ? "bg-ink font-semibold text-white" : "text-ink hover:bg-soft"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="px-2.5 text-sm leading-relaxed text-muted">
          <p>다음에 추가될 메뉴</p>
          <p>{UPCOMING_MENU}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-line bg-white px-7">
          {pathname.startsWith("/site") ? (
            <div className="flex items-center gap-3">
              <DeployStatus />
              <ExternalLink href={HOMEPAGE_URL} className={outlineButton}>
                홈페이지 열기
              </ExternalLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-muted">노션·구글 캘린더 최종 업데이트 {loadedAt}</span>
              <button type="button" onClick={refresh} className={outlineButton}>
                새로고침
              </button>
            </div>
          )}
          <UserSelect />
        </header>
        <main className="flex-1 px-7 py-8">{children}</main>
      </div>
    </div>
  );
}

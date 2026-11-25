"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { timeLabel } from "@/lib/date";
import { useStoreActions } from "@/lib/store";
import { useUser } from "@/lib/user";
import Avatar from "./Avatar";
import { outlineButton } from "./Button";
import { CONNECT_LATER, useToast } from "./Toast";

const MENU = [
  { label: "홈", href: "/" },
  { label: "캘린더", href: "/calendar" },
  { label: "진행 현황", href: "/progress" },
  { label: "팀 현황", href: "/team" },
];

const UPCOMING_MENU = "영업, 경영지원, 메일 공유, 설정";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

// Time the page was opened, read once in the browser (empty during prerender).
let openedAt: string | undefined;
const readOpenedAt = () => {
  if (!openedAt) {
    const now = new Date();
    openedAt = timeLabel(`${now.getHours()}:${now.getMinutes()}`);
  }
  return openedAt;
};
const subscribeNever = () => () => {};

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

function TrialNotice() {
  const { reset } = useStoreActions();
  const toast = useToast();

  const onReset = async () => {
    if (!window.confirm("체험용 데이터를 처음 상태로 되돌립니다. 바꾼 내용은 모두 사라집니다.")) return;
    await reset();
    toast("체험용 데이터를 처음 상태로 되돌렸습니다.");
  };

  return (
    <div className="mb-5 border-b border-line px-2.5 pb-5 text-sm text-faint">
      <p>체험판 · 바꾼 내용은 이 브라우저에만 저장됩니다</p>
      <button type="button" onClick={onReset} className="mt-1.5 text-muted underline underline-offset-2 hover:text-ink">
        체험용 데이터 초기화
      </button>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const toast = useToast();
  const opened = useSyncExternalStore(subscribeNever, readOpenedAt, () => "");

  return (
    <div className="flex min-h-screen min-w-[1280px]">
      <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col border-r border-line bg-white px-3.5 py-6">
        <Link href="/" className="mb-7 px-2.5">
          <p className="text-base font-extrabold tracking-wide">WITH THE LAKE</p>
          <p className="mt-0.5 text-sm text-muted">업무 관리</p>
        </Link>
        <nav className="flex-1">
          <ul className="space-y-1">
            {MENU.map((item) => (
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
        </nav>
        <TrialNotice />
        <div className="px-2.5 text-sm leading-relaxed text-muted">
          <p>다음에 추가될 메뉴</p>
          <p>{UPCOMING_MENU}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-line bg-white px-7">
          <div className="flex items-center gap-3">
            <span className="text-muted">최종 업데이트 {opened}</span>
            <button type="button" onClick={() => toast(CONNECT_LATER.refresh)} className={outlineButton}>
              새로고침
            </button>
          </div>
          <UserSelect />
        </header>
        <main className="flex-1 px-7 py-8">{children}</main>
      </div>
    </div>
  );
}

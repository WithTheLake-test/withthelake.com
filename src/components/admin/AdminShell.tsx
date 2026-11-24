"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  {
    href: "/admin/posts",
    label: "게시물",
    icon: <path d="M5 4h10l4 4v12H5zM8 12h8M8 16h6" />,
  },
  {
    href: "/admin/impact",
    label: "성과 (IMPACT)",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  },
];

/** 관리자 공통 틀: 왼쪽 메뉴 + 상단 바(경로·버튼) + 본문 */
export default function AdminShell({ crumbs, actions, children }: { crumbs: string[]; actions?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="grid min-h-screen grid-cols-[232px_1fr] bg-slate-100 text-[14px] text-slate-900">
      <div className="bg-navy">
        <aside className="sticky top-0 flex h-screen flex-col px-4 py-5 text-white">
          <div className="flex items-center gap-2.5 border-b border-white/10 px-2 pb-5">
            <Image src="/assets/logo/with-the-lake-white.png" alt="WITH THE LAKE" width={120} height={30} className="h-[30px] w-auto" />
            <span className="rounded border border-white/20 px-1.5 py-0.5 text-[12px] text-white/60">관리자</span>
          </div>
          <nav className="mt-4 flex flex-col gap-0.5">
            {NAV.map((n) => {
              const on = pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium ${on ? "bg-white/10 text-white" : "text-white/65 hover:text-white"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    {n.icon}
                  </svg>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <a href="/" target="_blank" rel="noreferrer" className="mt-auto flex items-center gap-2 border-t border-white/10 px-3 pt-4 text-[13px] text-white/55 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
            </svg>
            사이트 보기
          </a>
        </aside>
      </div>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-8">
          <p className="truncate text-[13px] text-slate-500">
            {["관리자", ...crumbs].map((c, i, all) => (
              <span key={i} className={i === all.length - 1 ? "font-semibold text-slate-900" : ""}>
                {i > 0 && " / "}
                {c}
              </span>
            ))}
          </p>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";

/** 오른쪽에서 열리는 편집 패널 */
export default function Drawer({ title, onClose, footer, children }: { title: string; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <h2 className="text-[16px] font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-[20px] leading-none text-slate-400 hover:text-slate-700" aria-label="닫기">
            ×
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4">{footer}</div>
      </div>
    </div>
  );
}

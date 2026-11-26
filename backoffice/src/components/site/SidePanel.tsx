import type { ReactNode } from "react";

// Right-hand edit panel used beside a list.
export default function SidePanel({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  return (
    <aside className="rounded-xl border border-line bg-white px-6 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="text-xl text-muted hover:text-ink" aria-label="닫기">
          ×
        </button>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>
    </aside>
  );
}

import type { ReactNode } from "react";

type Props = { title?: ReactNode; action?: ReactNode; className?: string; children: ReactNode };

export default function Card({ title, action, className = "", children }: Props) {
  return (
    <section className={`rounded-xl border border-line bg-white px-6 py-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <h2 className="text-base font-bold">{title}</h2>
          {action && <div className="shrink-0 text-muted">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// One row in a card list, separated by a thin line.
export function CardRow({ className = "", children }: { className?: string; children: ReactNode }) {
  return <li className={`flex items-center gap-3 border-b border-line py-3 last:border-b-0 ${className}`}>{children}</li>;
}

import type { ReactNode } from "react";
import type { Tone } from "@/lib/work/rules";

// Section heading used on the home screen: "1 · 오늘 상태" with an optional note on the right.
export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-9">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-sm font-bold text-muted">{title}</h2>
        {note && <div className="text-sm text-muted">{note}</div>}
      </div>
      {children}
    </section>
  );
}

export function Unavailable({ source }: { source: "노션" | "구글 캘린더" }) {
  return <p className="rounded-xl border border-dashed border-line bg-white px-5 py-6 text-center text-muted">{source === "노션" ? "노션을" : "구글 캘린더를"} 불러오지 못했습니다.</p>;
}

// Status colour: red = past, orange = within 3 days, gray = later.
export const TONE_TEXT: Record<Tone, string> = { late: "text-danger", soon: "text-orange-600", later: "text-muted" };
export const TONE_PILL: Record<Tone, string> = { late: "bg-red-50 text-danger", soon: "bg-orange-50 text-orange-600", later: "bg-soft text-muted" };

export function Pill({ tone, strong = false, children }: { tone: Tone; strong?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${strong && tone === "late" ? "bg-danger text-white" : TONE_PILL[tone]}`}>
      {children}
    </span>
  );
}

export const cardClass = "rounded-xl border border-line bg-white px-5 py-5";

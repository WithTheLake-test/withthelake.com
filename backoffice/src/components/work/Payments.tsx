import ExternalLink from "@/components/ExternalLink";
import { NOTION_PAYMENTS_URL } from "@/lib/links";
import { amountLabel, missingDate, paymentsThisMonth, won } from "@/lib/work/payments";
import type { Payment } from "@/lib/work/types";
import { cardClass } from "./ui";

// 이번 달 결제 예정 from the Notion 💳 구독·정기결제 DB (read-only; edited in Notion).
export default function Payments({ payments, error, today }: { payments?: Payment[]; error?: string; today: string }) {
  const due = payments ? paymentsThisMonth(payments, today) : [];
  const known = due.filter((p) => p.krw !== undefined);
  const total = known.reduce((sum, p) => sum + (p.krw ?? 0), 0);
  const unknown = due.length - known.length;
  const noDate = payments ? missingDate(payments).length : 0;

  return (
    <div className={cardClass}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-bold">이번 달 결제 예정</h3>
        {payments && due.length > 0 && <span className="text-sm font-semibold">{won(total)}</span>}
      </div>
      {!payments ? (
        <>
          <p className="text-sm text-danger">노션을 불러오지 못했습니다.</p>
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </>
      ) : due.length === 0 ? (
        <p className="text-muted">이번 달 결제 예정이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {due.map((p) => {
            const past = p.day < today;
            const isToday = p.day === today;
            const detail = [p.plan, p.users.join("·")].filter(Boolean).join(" · ");
            return (
              <li key={p.id} className={`flex items-center gap-2 ${past ? "text-faint" : ""}`}>
                <span className={`w-9 shrink-0 text-sm ${isToday ? "font-bold text-orange-600" : past ? "" : "text-muted"}`}>{isToday ? "오늘" : `${Number(p.day.slice(8))}일`}</span>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:underline">
                  {p.name}
                  {detail && <span className={`ml-1.5 text-sm ${past ? "" : "text-muted"}`}>{detail}</span>}
                </a>
                <span className={`shrink-0 text-sm ${past ? "" : p.krw === undefined ? "text-orange-600" : "text-muted"}`}>
                  {past ? "결제됨 · " : ""}
                  {amountLabel(p)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {payments && (unknown > 0 || noDate > 0) && (
        <p className="mt-3 text-sm text-orange-600">
          {[unknown > 0 && `원화 금액 없는 ${unknown}건은 합계에서 빠짐`, noDate > 0 && `결제일 없는 ${noDate}건 제외`].filter(Boolean).join(" · ")}
        </p>
      )}
      <ExternalLink href={NOTION_PAYMENTS_URL} className="mt-4 inline-block text-sm text-muted hover:text-ink">
        노션에서 구독·결제 관리
      </ExternalLink>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { adminApi, formatDateTime, type DeployInfo } from "@/lib/admin/client";

const POLL_MS = 5000;
const GIVE_UP_MS = 6 * 60 * 1000;

/**
 * 사이트 반영 상태. 저장 직후에는 해당 커밋의 빌드가 끝날 때까지 몇 초마다 확인합니다.
 * commit 이 없으면 저장소의 최신 커밋 상태를 한 번 보여 줍니다.
 */
export default function DeployStatus({ commit }: { commit?: string }) {
  const [info, setInfo] = useState<DeployInfo | null>(null);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    async function check() {
      const next = await adminApi<DeployInfo>(`deploy-status${commit ? `?sha=${commit}` : ""}`).catch(() => null);
      if (stop) return;
      setInfo(next);
      const pending = !next || next.state === "building" || (next.state === "unknown" && commit);
      if (commit && pending && Date.now() - started < GIVE_UP_MS) timer = setTimeout(check, POLL_MS);
    }
    void check();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [commit]);

  if (!info) return commit ? <Badge tone="busy">저장 완료 · 반영 상태 확인 중…</Badge> : null;
  if (info.state === "success") return <Badge tone="ok">{commit ? "사이트 반영 완료" : `마지막 반영 ${formatDateTime(info.committedAt)}`}</Badge>;
  if (info.state === "failure") return <Badge tone="fail">사이트 반영 실패 · Cloudflare 빌드 기록을 확인해 주세요</Badge>;
  if (commit) return <Badge tone="busy">저장 완료 · 사이트 반영 중 (1~3분)</Badge>;
  if (info.state === "building") return <Badge tone="busy">사이트 반영 중</Badge>;
  return <Badge tone="idle">{`마지막 저장 ${formatDateTime(info.committedAt)}`}</Badge>;
}

function Badge({ tone, children }: { tone: "ok" | "busy" | "fail" | "idle"; children: string }) {
  const color = { ok: "text-emerald-700", busy: "text-amber-600", fail: "text-red-600", idle: "text-slate-500" }[tone];
  const dot = { ok: "bg-emerald-500", busy: "animate-pulse bg-amber-500", fail: "bg-red-500", idle: "bg-slate-300" }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${color}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

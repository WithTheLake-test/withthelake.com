import type { DeployState } from "./github";

/** 관리자 화면에서 /api/admin/* 를 호출합니다. 실패하면 서버가 보낸 안내 문구로 Error 를 던집니다. */
export async function adminApi<T>(path: string, init?: { method?: "PUT" | "DELETE"; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/admin/${path}`, {
      method: init?.method ?? "GET",
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 관리자 실행 상태를 확인해 주세요.");
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (res.status === 404 && !data) throw new Error("관리자 API 를 찾을 수 없습니다. npm run admin 으로 실행했는지 확인해 주세요.");
  if (!res.ok || !data) throw new Error(data?.error ?? `요청 실패 (HTTP ${res.status})`);
  return data;
}

export type DeployInfo = { sha: string; state: DeployState; committedAt: string; message: string };

/** 2026.11.24 형식의 오늘 날짜 */
export function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

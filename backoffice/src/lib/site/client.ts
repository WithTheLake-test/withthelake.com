// Calls the save API (/api/site/*). On failure it throws with the server's message.
export class ApiError extends Error {
  constructor(
    message: string,
    public conflict = false,
  ) {
    super(message);
  }
}

export async function siteApi<T>(path: string, init?: { method?: "PUT" | "DELETE"; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/site/${path}`, {
      method: init?.method ?? "GET",
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError("저장 서버에 연결할 수 없습니다.");
  }
  // The 30-minute access session ran out: go back to the password screen, then return here.
  if (res.status === 401) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    throw new ApiError("접근 암호를 다시 입력해 주세요.");
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string; conflict?: boolean }) | null;
  if (!res.ok || !data) throw new ApiError(data?.error ?? `요청 실패 (HTTP ${res.status})`, !!data?.conflict);
  return data;
}

// Lets the deploy status in the top bar refresh right after a save.
export const SAVED_EVENT = "site:saved";
export const notifySaved = () => window.dispatchEvent(new Event(SAVED_EVENT));

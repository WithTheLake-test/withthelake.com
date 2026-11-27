"use client";

import { timeLabel } from "@/lib/date";
import { useWorkFeed } from "@/lib/work/feed";
import { outlineButton } from "./Button";
import { useToast } from "./Toast";

const at = (ms: number) => {
  const d = new Date(ms);
  return timeLabel(`${d.getHours()}:${d.getMinutes()}`);
};

// Top bar on the home and calendar screens: real sync times, and a refresh that skips the server cache.
export default function LiveSync() {
  const { feed, refreshing, refresh } = useWorkFeed();
  const toast = useToast();

  const onRefresh = async () => {
    await refresh();
    toast("노션·구글 캘린더를 다시 불러왔습니다.");
  };

  const part = (label: string, syncedAt?: number, error?: string) =>
    feed && !syncedAt ? (
      <span className="text-danger">
        {label} 연결 안 됨{error && ` (${error})`}
      </span>
    ) : (
      `${label} ${syncedAt ? at(syncedAt) : "…"}`
    );

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted">
        {part("노션", feed?.notion?.syncedAt, feed?.errors?.notion)} · {part("구글 캘린더", feed?.calendar?.syncedAt, feed?.errors?.calendar)} 동기화
      </span>
      <button type="button" onClick={onRefresh} disabled={refreshing} className={`${outlineButton} disabled:opacity-40`}>
        {refreshing ? "불러오는 중…" : "새로고침"}
      </button>
    </div>
  );
}

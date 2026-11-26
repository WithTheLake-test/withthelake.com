"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { WorkFeed } from "./types";

// Live Notion + Google Calendar data, loaded only on the home and calendar screens.

type FeedState = { feed: WorkFeed | null; refreshing: boolean; refresh: () => Promise<void> };

const FeedContext = createContext<FeedState | null>(null);

export const usesLiveFeed = (pathname: string) => pathname === "/" || pathname.startsWith("/calendar");

async function fetchFeed(fresh: boolean): Promise<WorkFeed> {
  try {
    const res = await fetch(`/api/work/feed${fresh ? "?fresh=1" : ""}`);
    if (res.status === 401) {
      // /login is served by the password middleware, not a Next.js page, so a full page load is needed.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as WorkFeed;
  } catch {
    // No save server (e.g. `npm run dev`) or a network error: both sides show their "could not load" notice.
    return { notion: null, calendar: null };
  }
}

export function WorkFeedProvider({ children }: { children: ReactNode }) {
  const active = usesLiveFeed(usePathname());
  const [feed, setFeed] = useState<WorkFeed | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (active && !feed) fetchFeed(false).then(setFeed);
  }, [active, feed]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setFeed(await fetchFeed(true));
    setRefreshing(false);
  }, []);

  return <FeedContext value={{ feed, refreshing, refresh }}>{children}</FeedContext>;
}

export function useWorkFeed() {
  const value = useContext(FeedContext);
  if (!value) throw new Error("useWorkFeed must be used inside WorkFeedProvider");
  return value;
}

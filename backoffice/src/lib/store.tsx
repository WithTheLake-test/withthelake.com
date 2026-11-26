"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { loadData } from "./data";
import type { AppData } from "./data/types";
import { nowTimeLabel } from "./date";

type StoreValue = { data: AppData | null; loadedAt: string; reload: () => Promise<void> };

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ data: AppData; loadedAt: string } | null>(null);

  const reload = useCallback(async () => {
    const data = await loadData();
    setState({ data, loadedAt: nowTimeLabel() });
  }, []);

  useEffect(() => {
    loadData().then((data) => setState({ data, loadedAt: nowTimeLabel() }));
  }, []);

  return (
    <StoreContext value={{ data: state?.data ?? null, loadedAt: state?.loadedAt ?? "", reload }}>{children}</StoreContext>
  );
}

function useStoreContext() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store hooks must be used inside StoreProvider");
  return value;
}

// Data depends on today's date in the browser, so screens render only after it loads.
export function StoreReady({ children }: { children: ReactNode }) {
  if (!useStoreContext().data) return <p className="py-20 text-center text-muted">불러오는 중</p>;
  return children;
}

export function useData() {
  const { data } = useStoreContext();
  if (!data) throw new Error("useData must be used inside StoreReady");
  return data;
}

export function useReload() {
  const { loadedAt, reload } = useStoreContext();
  return { loadedAt, reload };
}

"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as repo from "./data";
import type { AppData, NewTask, Task, TaskStatus } from "./data/types";

type Actions = {
  reload: () => Promise<void>;
  addTask: (input: NewTask) => Promise<Task>;
  updateTask: (id: string, patch: Partial<NewTask>) => Promise<void>;
  toggleTaskDone: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setGoalDone: (id: string, done: boolean) => Promise<void>;
  reset: () => Promise<void>;
};

const DataContext = createContext<AppData | null>(null);
const ActionsContext = createContext<Actions | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  // Status to restore when a task is unchecked again in this session.
  const statusBeforeDone = useRef(new Map<string, TaskStatus>());

  const actions = useMemo<Actions>(() => {
    const reload = async () => setData(await repo.loadData());
    const thenReload = async <T,>(operation: Promise<T>) => {
      const result = await operation;
      await reload();
      return result;
    };

    return {
      reload,
      addTask: (input) => thenReload(repo.addTask(input)),
      updateTask: (id, patch) => thenReload(repo.updateTask(id, patch)),
      toggleTaskDone: (task) => {
        if (task.status === "done") {
          return thenReload(repo.updateTask(task.id, { status: statusBeforeDone.current.get(task.id) ?? "todo" }));
        }
        statusBeforeDone.current.set(task.id, task.status);
        return thenReload(repo.updateTask(task.id, { status: "done" }));
      },
      deleteTask: (id) => thenReload(repo.deleteTask(id)),
      setGoalDone: (id, done) => thenReload(repo.updateWeeklyGoal(id, { done })),
      reset: () => thenReload(repo.resetData()),
    };
  }, []);

  useEffect(() => {
    actions.reload();
    return repo.subscribeData(actions.reload);
  }, [actions]);

  return (
    <ActionsContext value={actions}>
      <DataContext value={data}>{children}</DataContext>
    </ActionsContext>
  );
}

// Data depends on this browser's storage and today's date, so screens render only after it loads.
export function StoreReady({ children }: { children: ReactNode }) {
  const data = useContext(DataContext);
  if (!data) return <p className="py-20 text-center text-muted">불러오는 중</p>;
  return children;
}

export function useData() {
  const data = useContext(DataContext);
  if (!data) throw new Error("useData must be used inside StoreReady");
  return data;
}

export function useStoreActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("useStoreActions must be used inside StoreProvider");
  return actions;
}

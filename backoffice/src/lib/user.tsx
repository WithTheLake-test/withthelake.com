"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Member } from "./data/types";

// A new key, so a member saved under the old key starts from "everyone" once.
const STORAGE_KEY = "backoffice:viewer";
const OLD_KEY = "backoffice:user";
export const EVERYONE = "all";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_KEY, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_KEY, onChange);
  };
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// What the screens are viewed for: the whole team, or one member.
export type Viewer = { kind: "all" } | { kind: "member"; member: Member };

type UserContextValue = {
  viewer: Viewer;
  // The chosen member; undefined when viewing everyone.
  me?: Member;
  members: Member[];
  setViewer: (id: string) => void;
  memberOf: (id?: string) => Member | undefined;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ members, children }: { members: Member[]; children: ReactNode }) {
  const storedId = useSyncExternalStore(subscribe, readStored, () => null);
  const memberOf = (id?: string) => members.find((member) => member.id === id);
  const me = memberOf(storedId ?? undefined);
  const viewer: Viewer = me ? { kind: "member", member: me } : { kind: "all" };

  const setViewer = (id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
      localStorage.removeItem(OLD_KEY);
    } catch {}
    window.dispatchEvent(new Event(STORAGE_KEY));
  };

  return <UserContext value={{ viewer, me, members, setViewer, memberOf }}>{children}</UserContext>;
}

export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("useUser must be used inside UserProvider");
  return value;
}

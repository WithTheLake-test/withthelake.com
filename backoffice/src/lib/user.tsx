"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Member } from "./data/types";

const STORAGE_KEY = "backoffice:user";
// Until login exists, the team member below is the default current user.
const DEFAULT_USER_ID = "jin";

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

type UserContextValue = {
  user: Member;
  members: Member[];
  setUser: (id: string) => void;
  memberOf: (id?: string) => Member | undefined;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ members, children }: { members: Member[]; children: ReactNode }) {
  const storedId = useSyncExternalStore(subscribe, readStored, () => null);
  const memberOf = (id?: string) => members.find((member) => member.id === id);
  const user = memberOf(storedId ?? DEFAULT_USER_ID) ?? memberOf(DEFAULT_USER_ID) ?? members[0];

  const setUser = (id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    window.dispatchEvent(new Event(STORAGE_KEY));
  };

  return <UserContext value={{ user, members, setUser, memberOf }}>{children}</UserContext>;
}

export function useUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("useUser must be used inside UserProvider");
  return value;
}

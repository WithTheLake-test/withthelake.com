"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export const CONNECT_LATER = {
  notion: "노션 연결 후 사용할 수 있습니다.",
  calendar: "구글 캘린더 연결 후 사용할 수 있습니다.",
  refresh: "노션·구글 캘린더 연결 후 최신 내용을 불러옵니다.",
};

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((next: string) => {
    setMessage(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2500);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
        {message && <p className="rounded-lg bg-ink px-5 py-3 text-white shadow-lg">{message}</p>}
      </div>
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);

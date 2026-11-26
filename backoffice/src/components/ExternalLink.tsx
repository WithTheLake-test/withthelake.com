"use client";

import type { ReactNode } from "react";
import { useToast } from "./Toast";

type Props = { href: string; children: ReactNode; className?: string; pendingMessage?: string };

// Opens Notion / Google Calendar in a new tab. While the address is still "#", it only shows a short notice.
export default function ExternalLink({ href, children, className, pendingMessage = "노션 연결 후 열립니다." }: Props) {
  const toast = useToast();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        if (href !== "#") return;
        e.preventDefault();
        toast(pendingMessage);
      }}
    >
      {children} ↗
    </a>
  );
}

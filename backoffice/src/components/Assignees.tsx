"use client";

import { useUser } from "@/lib/user";

// "정미경, 김진", shortened with an ellipsis when narrow; red "미지정" when empty.
type Props = { ids: string[]; muted?: boolean; className?: string };

export default function Assignees({ ids, muted = false, className = "" }: Props) {
  const { memberOf } = useUser();
  const names = ids.map((id) => memberOf(id)?.name).filter(Boolean).join(", ");
  return (
    <span title={names || undefined} className={`truncate ${names ? (muted ? "text-muted" : "") : "text-danger"} ${className}`}>
      {names || "미지정"}
    </span>
  );
}

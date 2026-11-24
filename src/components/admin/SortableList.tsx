"use client";

import { useState, type ReactNode } from "react";
import { GripIcon } from "./ui";

/**
 * 손잡이를 끌어서 순서를 바꾸는 목록.
 * 행 안의 입력칸 선택을 방해하지 않도록 손잡이를 잡았을 때만 끌 수 있게 합니다.
 */
export default function SortableList<T>({
  items,
  onChange,
  getKey,
  renderItem,
  className = "",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  className?: string;
}) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div
          key={getKey(item, i)}
          draggable={armed === i}
          onDragStart={(e) => {
            setDragging(i);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            if (dragging === null) return;
            e.preventDefault();
            if (dragging !== i) {
              move(dragging, i);
              setDragging(i);
            }
          }}
          onDragEnd={() => {
            setDragging(null);
            setArmed(null);
          }}
          className={dragging === i ? "opacity-50" : ""}
        >
          {renderItem(
            item,
            i,
            <span
              onPointerDown={() => setArmed(i)}
              onPointerUp={() => setArmed(null)}
              className="flex w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500"
              title="끌어서 순서 바꾸기"
            >
              <GripIcon />
            </span>,
          )}
        </div>
      ))}
    </div>
  );
}

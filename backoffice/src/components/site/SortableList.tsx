"use client";

import { useState, type ReactNode } from "react";

// Reorder by dragging the handle only, so text inside rows can still be selected.
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

  const move = (from: number, to: number) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div
          key={getKey(item, i)}
          data-sortable={i}
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
              className="flex w-5 shrink-0 cursor-grab items-center justify-center text-faint hover:text-muted"
              title="끌어서 순서 바꾸기"
              aria-hidden
            >
              ⋮⋮
            </span>,
          )}
        </div>
      ))}
    </div>
  );
}

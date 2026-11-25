"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  label: ReactNode;
  children: (close: () => void) => ReactNode;
  className?: string;
};

export default function Dropdown({ label, children, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[38px] items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 hover:bg-soft ${className}`}
      >
        <span className="truncate">{label}</span>
        <span className="text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1.5 min-w-full rounded-xl border border-line bg-white p-2 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

type SelectProps<T extends string> = {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
};

export function SelectDropdown<T extends string>({ label, value, options, onChange, className }: SelectProps<T>) {
  const current = options.find((option) => option.value === value)?.label ?? "";
  return (
    <Dropdown
      className={className}
      label={
        label ? (
          <>
            {label}: <strong>{current}</strong>
          </>
        ) : (
          <strong>{current}</strong>
        )
      }
    >
      {(close) => (
        <ul className="min-w-40">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left hover:bg-soft ${
                  option.value === value ? "font-semibold" : ""
                }`}
              >
                {option.label}
                {option.value === value && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}

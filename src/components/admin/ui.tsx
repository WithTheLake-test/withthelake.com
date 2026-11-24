"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/** 관리자 화면 공통 UI. 슬레이트 계열 중립 톤에 사이트 보라색을 포인트로 사용합니다. */

const BUTTON = {
  primary: "border-primary bg-primary text-white hover:bg-primary-dark disabled:opacity-60",
  secondary: "border-slate-300 bg-white text-slate-700 hover:border-slate-400 disabled:opacity-60",
  danger: "border-red-200 bg-white text-red-600 hover:border-red-400 disabled:opacity-60",
};
const SIZE = { md: "h-10 px-4 text-[14px]", sm: "h-8 px-3 text-[13px]" };

type ButtonStyle = { variant?: keyof typeof BUTTON; size?: keyof typeof SIZE };
const buttonClass = ({ variant = "secondary", size = "md" }: ButtonStyle, extra = "") =>
  `inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border font-semibold transition-colors ${BUTTON[variant]} ${SIZE[size]} ${extra}`;

export function Button({ variant, size, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle) {
  return <button type="button" {...props} className={buttonClass({ variant, size }, className)} />;
}

export function ButtonLink({ href, variant, size, children }: { href: string; children: ReactNode } & ButtonStyle) {
  return (
    <Link href={href} className={buttonClass({ variant, size })}>
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function PageHeading({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">{title}</h1>
        {desc && <p className="mt-1 text-[13px] text-slate-500">{desc}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-slate-400">{hint}</span>}
    </label>
  );
}

const INPUT = "w-full rounded-lg border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${INPUT} h-10 ${props.className ?? ""}`} />;

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={3} {...props} className={`${INPUT} py-2.5 leading-relaxed ${props.className ?? ""}`} />
);

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`${INPUT} h-10 ${props.className ?? ""}`} />;

export function Notice({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  const color = tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-600";
  return <div className={`rounded-lg border px-4 py-3 text-[14px] ${color}`}>{children}</div>;
}

export function Loading() {
  return <p className="py-16 text-center text-[14px] text-slate-400">불러오는 중…</p>;
}

/** 손잡이 모양 (끌어서 순서 바꾸기) */
export function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
    </svg>
  );
}

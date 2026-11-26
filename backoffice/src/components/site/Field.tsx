import type { ReactNode } from "react";

export const inputClass = "w-full rounded-lg border border-line bg-white px-3 outline-none focus:border-ink aria-[invalid=true]:border-danger";

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block font-semibold">
        {label}
        {required && <span className="ml-0.5 text-muted">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-danger">{error}</span> : hint && <span className="mt-1.5 block text-sm text-muted">{hint}</span>}
    </div>
  );
}

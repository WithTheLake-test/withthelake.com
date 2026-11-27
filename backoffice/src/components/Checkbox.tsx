// Without onChange it only shows the state (read-only data such as Notion).
type Props = { checked: boolean; onChange?: () => void; label: string; showLabel?: boolean };

export default function Checkbox({ checked, onChange, label, showLabel = false }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-readonly={!onChange || undefined}
      aria-label={showLabel ? undefined : label}
      onClick={onChange}
      disabled={!onChange}
      className="inline-flex shrink-0 items-center gap-2"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border ${
          checked ? "border-ink bg-ink text-white" : "border-faint/70 bg-white"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M2.5 6.5l2.5 2.5 4.5-5" />
          </svg>
        )}
      </span>
      {showLabel && label}
    </button>
  );
}

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function ToggleGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="mr-1 font-semibold">{label}</span>}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`h-[38px] rounded-lg border px-4 ${
              selected ? "border-ink bg-ink font-semibold text-white" : "border-line bg-white text-ink hover:bg-soft"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-line bg-white">
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`h-[38px] px-5 ${i > 0 ? "border-l border-line" : ""} ${
              selected ? "bg-ink font-semibold text-white" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

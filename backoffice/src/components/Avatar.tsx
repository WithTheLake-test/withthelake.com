const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  lg: "h-11 w-11 text-sm",
};

export default function Avatar({ label, size = "sm" }: { label: string; size?: keyof typeof SIZES }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-soft font-semibold text-ink ${SIZES[size]}`}>
      {label}
    </span>
  );
}

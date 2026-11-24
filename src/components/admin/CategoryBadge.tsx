const TONES = [
  "bg-orange-50 text-orange-700",
  "bg-emerald-50 text-emerald-700",
  "bg-sky-50 text-sky-700",
  "bg-primary-soft text-primary",
  "bg-rose-50 text-rose-700",
  "bg-slate-100 text-slate-700",
];

/** 카테고리 순서에 따라 색을 정합니다. */
export default function CategoryBadge({ category, categories }: { category: string; categories: string[] }) {
  const i = categories.indexOf(category);
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${TONES[i < 0 ? TONES.length - 1 : i % TONES.length]}`}>{category}</span>;
}

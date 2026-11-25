import type { ReactNode } from "react";

type Props = { title: string; description: ReactNode; actions?: ReactNode };

export default function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        <h1 className="text-[26px] font-bold">{title}</h1>
        <p className="mt-1.5 text-base text-muted">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

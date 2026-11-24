"use client";

import { useState } from "react";
import type { Block } from "@/lib/admin/impact-schema";
import AdminImage from "../AdminImage";
import FieldInput from "../FieldInput";
import SortableList from "../SortableList";
import StringListInput from "../StringListInput";
import { Button, Card } from "../ui";
import ItemDrawer from "./ItemDrawer";
import HistoryEditor, { type HistoryYear } from "./HistoryEditor";

type Item = Record<string, unknown>;
type BlockProps<K extends Block["kind"]> = { block: Extract<Block, { kind: K }>; value: unknown; onChange: (v: unknown) => void };

/** 블록 종류에 맞는 편집 화면 */
export default function ImpactBlock({ block, value, onChange }: { block: Block; value: unknown; onChange: (v: unknown) => void }) {
  switch (block.kind) {
    case "intro":
      return <IntroBlock block={block} value={value} onChange={onChange} />;
    case "object":
      return <ObjectBlock block={block} value={value} onChange={onChange} />;
    case "list":
      return <ListBlock block={block} value={value} onChange={onChange} />;
    case "strings":
      return (
        <section>
          <BlockTitle title={block.title} count={(value as string[]).length} />
          <StringListInput value={value as string[]} onChange={onChange} addLabel={`${block.itemName} 추가`} />
        </section>
      );
    case "history":
      return <HistoryEditor value={value as HistoryYear[]} onChange={onChange} />;
  }
}

function BlockTitle({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h3 className="text-[15px] font-bold text-slate-900">
        {title}
        {count !== undefined && <span className="ml-1.5 text-[13px] font-medium text-slate-400">{count}</span>}
      </h3>
      {action}
    </div>
  );
}

function IntroBlock({ block, value, onChange }: BlockProps<"intro">) {
  const [open, setOpen] = useState(false);
  const intro = value as { title: string; lead?: string };
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <h2 className="text-[17px] font-bold text-slate-900">{intro.title}</h2>
        {intro.lead && <p className="mt-1 max-w-3xl text-[13px] text-slate-500">{intro.lead}</p>}
      </div>
      <Button size="sm" onClick={() => setOpen(true)}>
        섹션 소개 문구 수정
      </Button>
      {open && (
        <ItemDrawer
          title="섹션 소개 문구 수정"
          fields={block.fields}
          initial={intro}
          onClose={() => setOpen(false)}
          onApply={(v) => {
            onChange(v);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ObjectBlock({ block, value, onChange }: BlockProps<"object">) {
  const obj = value as Item;
  return (
    <section>
      <BlockTitle title={block.title} />
      <Card className="space-y-4 p-5">
        {block.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={obj[f.key]} onChange={(v) => onChange({ ...obj, [f.key]: v })} />
        ))}
      </Card>
    </section>
  );
}

function ListBlock({ block, value, onChange }: BlockProps<"list">) {
  const items = value as Item[];
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const { summary } = block;
  const text = (item: Item, key?: string) => (key ? String(item[key] ?? "") : "");

  function remove(i: number) {
    if (!window.confirm(`'${text(items[i], summary.title)}' 항목을 삭제할까요? 저장해야 사이트에 반영됩니다.`)) return;
    onChange(items.filter((_, j) => j !== i));
    setEditing(null);
  }

  return (
    <section>
      <BlockTitle title={block.title} count={items.length} />
      <Card className="overflow-hidden">
        <SortableList
          items={items}
          onChange={onChange}
          getKey={(item, i) => `${text(item, summary.title)}-${i}`}
          renderItem={(item, i, handle) => (
            <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-3">
              {handle}
              {summary.image && <AdminImage src={text(item, summary.image)} className="h-[58px] w-[88px] shrink-0 rounded-md" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{text(item, summary.title)}</p>
                {summary.desc && <p className="mt-0.5 truncate text-[13px] text-slate-500">{text(item, summary.desc)}</p>}
              </div>
              <Button size="sm" onClick={() => setEditing(i)}>
                수정
              </Button>
              <Button size="sm" variant="danger" onClick={() => remove(i)}>
                삭제
              </Button>
            </div>
          )}
        />
        <button type="button" onClick={() => setEditing("new")} className="w-full border-t border-dashed border-slate-200 bg-primary-light/40 py-3.5 text-[14px] font-semibold text-primary hover:bg-primary-light">
          + {block.itemName} 추가
        </button>
      </Card>
      {editing !== null && (
        <ItemDrawer
          title={`${block.itemName} ${editing === "new" ? "추가" : "수정"}`}
          fields={block.fields}
          initial={editing === "new" ? Object.fromEntries(block.fields.map((f) => [f.key, ""])) : items[editing]}
          onClose={() => setEditing(null)}
          onDelete={editing === "new" ? undefined : () => remove(editing)}
          onApply={(item) => {
            onChange(editing === "new" ? [...items, item] : items.map((it, j) => (j === editing ? item : it)));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

"use client";

import { dangerButton, outlineButton } from "@/components/Button";
import Card from "@/components/Card";
import type { Block } from "@/lib/site/impact-schema";
import { sameValue } from "@/lib/site/path";
import FieldInput from "../FieldInput";
import SiteImage from "../SiteImage";
import SortableList from "../SortableList";
import StringListInput, { AddRowButton } from "../StringListInput";
import HistoryEditor, { type HistoryYear } from "./HistoryEditor";
import type { Item, PanelRequest } from "./types";

type Props<B extends Block = Block> = {
  block: B;
  value: unknown;
  original: unknown;
  onChange: (v: unknown) => void;
  openPanel: (request: PanelRequest) => void;
};

function BlockTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h3 className="mb-3 text-base font-bold">
      {title}
      {count !== undefined && <span className="ml-1.5 font-normal text-muted">{count}</span>}
    </h3>
  );
}

// Edit view for each block kind in the impact schema.
export default function ImpactBlock(props: Props) {
  const { block, value, onChange } = props;
  switch (block.kind) {
    case "intro":
      return <IntroBlock {...props} block={block} />;
    case "object":
      return (
        <section>
          <BlockTitle title={block.title} />
          <Card className="space-y-4">
            {block.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={(value as Item)[f.key]} onChange={(v) => onChange({ ...(value as Item), [f.key]: v })} />
            ))}
          </Card>
        </section>
      );
    case "list":
      return <ListBlock {...props} block={block} />;
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

function IntroBlock({ block, value, onChange, openPanel }: Props<Extract<Block, { kind: "intro" }>>) {
  const intro = value as { title: string; lead?: string };
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold">{intro.title}</h2>
        {intro.lead && <p className="mt-1 max-w-3xl text-muted">{intro.lead}</p>}
      </div>
      <button
        type="button"
        className={`${outlineButton} shrink-0`}
        onClick={() => openPanel({ title: "섹션 소개 문구 수정", fields: block.fields, initial: intro, onApply: onChange })}
      >
        섹션 소개 문구 수정
      </button>
    </div>
  );
}

function ListBlock({ block, value, original, onChange, openPanel }: Props<Extract<Block, { kind: "list" }>>) {
  const items = value as Item[];
  const before = (original as Item[] | undefined) ?? [];
  const { summary } = block;
  const text = (item: Item, key?: string) => (key ? String(item[key] ?? "") : "");

  const remove = (i: number) => {
    if (!window.confirm(`'${text(items[i], summary.title)}' 항목을 삭제합니다. 변경 사항을 저장해야 홈페이지에 반영됩니다.`)) return;
    onChange(items.filter((_, j) => j !== i));
  };
  const edit = (i: number | "new") =>
    openPanel({
      title: `${block.itemName} ${i === "new" ? "추가" : "수정"}`,
      fields: block.fields,
      initial: i === "new" ? Object.fromEntries(block.fields.map((f) => [f.key, f.type === "images" ? [] : ""])) : items[i],
      onApply: (item) => onChange(i === "new" ? [...items, item] : items.map((it, j) => (j === i ? item : it))),
    });

  return (
    <section>
      <BlockTitle title={block.title} count={items.length} />
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <SortableList
          items={items}
          onChange={onChange}
          getKey={(item, i) => `${text(item, summary.title)}-${i}`}
          renderItem={(item, i, handle) => (
            <div className="flex items-center gap-4 border-b border-line px-4 py-3">
              {handle}
              {summary.image && <SiteImage src={text(item, summary.image)} className="h-[58px] w-[88px] shrink-0 rounded-md" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  <span className="truncate">{text(item, summary.title)}</span>
                  {!before.some((b) => sameValue(b, item)) && (
                    <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-xs font-normal text-muted">수정됨</span>
                  )}
                </p>
                {summary.desc && <p className="mt-0.5 truncate text-sm text-muted">{text(item, summary.desc)}</p>}
              </div>
              <button type="button" onClick={() => edit(i)} className={`${outlineButton} h-9`}>
                수정
              </button>
              <button type="button" onClick={() => remove(i)} className={dangerButton}>
                삭제
              </button>
            </div>
          )}
        />
        <AddRowButton onClick={() => edit("new")}>{`${block.itemName} 추가`}</AddRowButton>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { FieldDef } from "@/lib/admin/impact-schema";
import Drawer from "../Drawer";
import FieldInput, { missingField } from "../FieldInput";
import { Button } from "../ui";

type Item = Record<string, unknown>;

/** 항목 하나를 오른쪽 패널에서 편집합니다. '적용'을 눌러야 목록에 반영됩니다. */
export default function ItemDrawer({
  title,
  fields,
  initial,
  onApply,
  onDelete,
  onClose,
}: {
  title: string;
  fields: FieldDef[];
  initial: Item;
  onApply: (item: Item) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [item, setItem] = useState(initial);
  const [error, setError] = useState("");

  function apply() {
    const missing = missingField(fields, item);
    if (missing) return setError(missing);
    onApply(item);
  }

  return (
    <Drawer
      title={title}
      onClose={onClose}
      footer={
        <>
          {onDelete ? (
            <Button variant="danger" onClick={onDelete}>
              삭제
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {error && <span className="text-[12px] text-red-600">{error}</span>}
            <Button onClick={onClose}>취소</Button>
            <Button variant="primary" onClick={apply}>
              적용
            </Button>
          </div>
        </>
      }
    >
      {fields.map((f) => (
        <FieldInput key={f.key} field={f} value={item[f.key]} onChange={(v) => setItem((p) => ({ ...p, [f.key]: v }))} />
      ))}
    </Drawer>
  );
}

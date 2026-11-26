"use client";

import { useState } from "react";
import { outlineButton, primaryButton } from "@/components/Button";
import FieldInput, { missingField } from "../FieldInput";
import SidePanel from "../SidePanel";
import type { PanelRequest } from "./types";

// Edits one item on the right. Changes reach the list only after '적용'.
export default function ItemPanel({ request, onClose }: { request: PanelRequest; onClose: () => void }) {
  const [item, setItem] = useState(request.initial);
  const [error, setError] = useState("");

  const apply = () => {
    const missing = missingField(request.fields, item);
    if (missing) return setError(missing);
    request.onApply(item);
    onClose();
  };

  return (
    <SidePanel
      title={request.title}
      onClose={onClose}
      footer={
        <>
          {error && <span className="mr-auto text-sm text-danger">{error}</span>}
          <button type="button" onClick={onClose} className={outlineButton}>
            취소
          </button>
          <button type="button" onClick={apply} className={primaryButton}>
            적용
          </button>
        </>
      }
    >
      {request.fields.map((f) => (
        <FieldInput key={f.key} field={f} value={item[f.key]} onChange={(v) => setItem((prev) => ({ ...prev, [f.key]: v }))} />
      ))}
    </SidePanel>
  );
}

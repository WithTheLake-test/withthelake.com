"use client";

import { useState } from "react";
import { useUser } from "@/lib/user";
import Checkbox from "./Checkbox";
import Dropdown from "./Dropdown";

type Props = { value: string[]; onChange: (ids: string[]) => void; className?: string };

export default function MemberDropdown({ value, onChange, className }: Props) {
  const { user, members, memberOf } = useUser();
  const nameOf = (id: string) => (id === user.id ? `${user.name} (나)` : memberOf(id)?.name ?? "");

  let summary = "선택 없음";
  if (value.length === members.length) summary = `전체 (${members.length}명)`;
  else if (value.length === 1) summary = nameOf(value[0]);
  else if (value.length > 1) summary = `${nameOf(value[0])} 외 ${value.length - 1}명`;

  return (
    <Dropdown
      className={className}
      label={
        <>
          담당자: <strong>{summary}</strong>
        </>
      }
    >
      {(close) => (
        <MemberPicker
          initial={value}
          onApply={(ids) => {
            onChange(ids);
            close();
          }}
        />
      )}
    </Dropdown>
  );
}

function MemberPicker({ initial, onApply }: { initial: string[]; onApply: (ids: string[]) => void }) {
  const { user, members } = useUser();
  const [draft, setDraft] = useState(initial);
  const [query, setQuery] = useState("");

  const ordered = [user, ...members.filter((member) => member.id !== user.id)];
  const visible = ordered.filter((member) => member.name.includes(query.trim()));
  const toggle = (id: string) => setDraft((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  return (
    <div className="w-64">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="이름 검색"
        className="h-[38px] w-full rounded-lg border border-line px-3 outline-none focus:border-ink"
      />
      <ul className="my-2">
        {visible.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-1 py-2">
            <Checkbox label={member.name} checked={draft.includes(member.id)} onChange={() => toggle(member.id)} />
            <button type="button" onClick={() => toggle(member.id)} className="flex-1 text-left">
              {member.id === user.id ? `${member.name} (나)` : member.name}
            </button>
            <span className="text-sm text-muted">{member.role}</span>
          </li>
        ))}
        {visible.length === 0 && <li className="px-1 py-3 text-muted">검색 결과 없음</li>}
      </ul>
      <div className="flex items-center justify-between border-t border-line pt-2">
        <button type="button" onClick={() => setDraft([])} className="px-1 text-muted hover:text-ink">
          전체 해제
        </button>
        <button type="button" onClick={() => onApply(draft)} className="h-9 rounded-lg bg-ink px-4 font-semibold text-white">
          적용
        </button>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ImpactContent } from "@/lib/cms/types";
import { adminApi } from "@/lib/admin/client";
import { EDITED_PATHS, IMPACT_TABS } from "@/lib/admin/impact-schema";
import { getIn, setIn } from "@/lib/admin/path";
import { UploadsProvider, useUploads } from "@/lib/admin/uploads";
import { useUnsavedWarning } from "@/lib/admin/useUnsavedWarning";
import AdminShell from "@/components/admin/AdminShell";
import DeployStatus from "@/components/admin/DeployStatus";
import ImpactBlock from "@/components/admin/impact/Blocks";
import { Button, Loading, Notice, PageHeading } from "@/components/admin/ui";

export default function ImpactPage() {
  return (
    <UploadsProvider>
      <Suspense>
        <ImpactEditor />
      </Suspense>
    </UploadsProvider>
  );
}

function ImpactEditor() {
  const tabId = useSearchParams().get("tab");
  const tab = IMPACT_TABS.find((t) => t.id === tabId) ?? IMPACT_TABS[0];
  const uploads = useUploads();

  const [saved, setSaved] = useState<{ impact: ImpactContent; sha: string } | null>(null);
  const [draft, setDraft] = useState<ImpactContent | null>(null);
  const [status, setStatus] = useState<{ error?: string; busy?: boolean; commit?: string }>({});

  useEffect(() => {
    adminApi<{ impact: ImpactContent; sha: string }>("impact").then(
      (d) => {
        setSaved(d);
        setDraft(d.impact);
      },
      (e: Error) => setStatus({ error: e.message }),
    );
  }, []);

  const changed = saved && draft ? EDITED_PATHS.filter((p) => JSON.stringify(getIn(saved.impact, p)) !== JSON.stringify(getIn(draft, p))).length : 0;
  useUnsavedWarning(changed > 0);

  async function save() {
    if (!saved || !draft) return;
    setStatus({ busy: true });
    try {
      const res = await adminApi<{ commit: string; sha: string }>("impact", { method: "PUT", body: { impact: draft, sha: saved.sha, uploads: uploads.list() } });
      uploads.clear();
      setSaved({ impact: draft, sha: res.sha });
      setStatus({ commit: res.commit });
    } catch (e) {
      setStatus({ error: (e as Error).message });
    }
  }

  function revert() {
    if (!saved || !window.confirm("저장하지 않은 변경을 모두 되돌릴까요?")) return;
    setDraft(saved.impact);
    uploads.clear();
    setStatus({});
  }

  return (
    <AdminShell
      crumbs={["성과", tab.label]}
      actions={
        changed > 0 ? (
          <>
            <span className="mr-1 text-[13px] text-slate-500">저장하지 않은 변경 {changed}건</span>
            <Button onClick={revert} disabled={status.busy}>
              되돌리기
            </Button>
            <Button variant="primary" onClick={save} disabled={status.busy}>
              {status.busy ? "저장 중…" : "변경 사항 저장"}
            </Button>
          </>
        ) : (
          <DeployStatus commit={status.commit} />
        )
      }
    >
      <PageHeading title="성과 (IMPACT)" desc="IMPACT 페이지의 항목을 관리합니다. 순서는 왼쪽 손잡이를 끌어서 바꿉니다. 저장하면 1~3분 뒤 사이트에 반영됩니다." />
      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {IMPACT_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/impact?tab=${t.id}`}
            replace
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[14px] font-semibold ${t.id === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {status.error && <div className="mt-5"><Notice>{status.error}</Notice></div>}
      {!draft ? (
        !status.error && <Loading />
      ) : (
        <div className="mt-6 max-w-5xl space-y-8">
          {tab.blocks.map((block, i) => (
            <ImpactBlock key={`${tab.id}-${i}`} block={block} value={getIn(draft, block.path)} onChange={(v) => setDraft((d) => d && setIn(d, block.path, v))} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { outlineButton, primaryButton } from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import ImpactBlock from "@/components/site/impact/ImpactBlock";
import ItemPanel from "@/components/site/impact/ItemPanel";
import type { PanelRequest } from "@/components/site/impact/types";
import { useToast } from "@/components/Toast";
import type { ImpactContent } from "@/generated/site-types";
import { SAVE_LATER, loadSiteData } from "@/lib/site/data";
import { EDITED_PATHS, IMPACT_TABS } from "@/lib/site/impact-schema";
import { getIn, sameValue, setIn } from "@/lib/site/path";
import { UploadsProvider, useUploads } from "@/lib/site/uploads";
import { useUnsavedWarning } from "@/lib/site/useUnsavedWarning";

export default function ImpactView() {
  return (
    <UploadsProvider>
      <ImpactEditor />
    </UploadsProvider>
  );
}

function ImpactEditor() {
  const tabId = useSearchParams().get("tab");
  const tab = IMPACT_TABS.find((t) => t.id === tabId) ?? IMPACT_TABS[0];
  const toast = useToast();
  const uploads = useUploads();
  const [saved, setSaved] = useState<ImpactContent | null>(null);
  const [draft, setDraft] = useState<ImpactContent | null>(null);
  const [panel, setPanel] = useState<PanelRequest | null>(null);

  useEffect(() => {
    loadSiteData().then(({ impact }) => {
      setSaved(impact);
      setDraft(impact);
    });
  }, []);

  const changed = saved && draft ? EDITED_PATHS.filter((p) => !sameValue(getIn(saved, p), getIn(draft, p))).length : 0;
  useUnsavedWarning(changed > 0);

  const revert = () => {
    if (!saved || !window.confirm("저장하지 않은 변경을 모두 되돌립니다.")) return;
    setDraft(saved);
    setPanel(null);
    uploads.clear();
  };

  return (
    <>
      <PageHeader
        title="성과 (IMPACT)"
        description="홈페이지 IMPACT 메뉴의 항목을 관리합니다. 순서는 왼쪽 ⋮⋮ 손잡이를 끌어서 바꿉니다."
        actions={
          changed > 0 && (
            <>
              <span className="mr-2 text-muted">저장하지 않은 변경 {changed}건</span>
              <button type="button" onClick={revert} className={outlineButton}>
                되돌리기
              </button>
              <button type="button" onClick={() => toast(SAVE_LATER)} className={primaryButton}>
                변경 사항 저장
              </button>
            </>
          )
        }
      />

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {IMPACT_TABS.map((t) => (
          <Link
            key={t.id}
            href={`/site/impact?tab=${t.id}`}
            replace
            onClick={() => setPanel(null)}
            className={`-mb-px border-b-2 px-4 py-3 whitespace-nowrap ${
              t.id === tab.id ? "border-ink font-bold text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {!draft || !saved ? (
        <p className="py-20 text-center text-muted">불러오는 중</p>
      ) : (
        <div className={`grid items-start gap-5 ${panel ? "grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1"}`}>
          <div className="space-y-8">
            {tab.blocks.map((block, i) => (
              <ImpactBlock
                key={`${tab.id}-${i}`}
                block={block}
                value={getIn(draft, block.path)}
                original={getIn(saved, block.path)}
                onChange={(v) => setDraft((d) => d && setIn(d, block.path, v))}
                openPanel={setPanel}
              />
            ))}
          </div>
          {panel && <ItemPanel key={panel.title + JSON.stringify(panel.initial)} request={panel} onClose={() => setPanel(null)} />}
        </div>
      )}

      <p className="mt-6 rounded-xl bg-soft px-5 py-3 text-muted">
        &apos;적용&apos;은 이 화면에만 반영됩니다. 위의 &apos;변경 사항 저장&apos;을 눌러야 홈페이지에 반영됩니다.
      </p>
    </>
  );
}

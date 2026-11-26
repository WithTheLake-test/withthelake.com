"use client";

import { useCallback, useEffect, useState } from "react";
import { timeLabel } from "@/lib/date";
import { SAVED_EVENT, siteApi } from "@/lib/site/client";

type Deploy = { state: "building" | "success" | "failure" | "unknown"; committedAt: string; commitUrl: string; detailsUrl: string | null; checkedAt: number };

const LABEL: Record<Deploy["state"], string> = { building: "반영 중", success: "반영 완료", failure: "실패", unknown: "확인 중" };
const POLL_MS = 15_000;
// A build record usually appears within a minute; after this, a missing record means no homepage build for the commit.
const RECORD_WAIT_MS = 3 * 60_000;

const timeOf = (iso: string) => {
  const d = new Date(iso);
  return timeLabel(`${d.getHours()}:${d.getMinutes()}`);
};

// Homepage build state of the latest commit on the save branch; refreshes after a save and while building.
export default function DeployStatus() {
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await siteApi<Omit<Deploy, "checkedAt">>("deploy-status");
      setDeploy({ ...data, checkedAt: Date.now() });
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    // Wait for GitHub to register the new commit's build before asking.
    const onSaved = () => setTimeout(refresh, 3000);
    const first = setTimeout(refresh, 0);
    window.addEventListener(SAVED_EVENT, onSaved);
    return () => {
      clearTimeout(first);
      window.removeEventListener(SAVED_EVENT, onSaved);
    };
  }, [refresh]);

  const waitingForRecord = deploy?.state === "unknown" && deploy.checkedAt - new Date(deploy.committedAt).getTime() < RECORD_WAIT_MS;

  useEffect(() => {
    if (deploy?.state !== "building" && !waitingForRecord) return;
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [deploy?.state, waitingForRecord, refresh]);

  if (offline || !deploy) {
    return (
      <span className="text-muted">
        홈페이지 반영 상태: <strong className="text-ink">{offline ? "연결 전" : "확인 중"}</strong>
      </span>
    );
  }

  return (
    <span className="text-muted">
      홈페이지 반영 상태:{" "}
      <strong className={deploy.state === "failure" ? "text-danger" : "text-ink"}>
        {deploy.state === "unknown" && !waitingForRecord ? "빌드 기록 없음" : LABEL[deploy.state]}
      </strong>{" "}
      · {timeOf(deploy.committedAt)}
      {deploy.state === "failure" && (
        <>
          {" "}
          — Cloudflare 대시보드 → withthelake-test → 배포 기록에서 빌드 로그를 확인하세요.{" "}
          <a href={deploy.detailsUrl ?? deploy.commitUrl} target="_blank" rel="noopener noreferrer" className="underline">
            빌드 기록 보기
          </a>
        </>
      )}
    </span>
  );
}

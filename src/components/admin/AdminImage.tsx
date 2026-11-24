"use client";
/* eslint-disable @next/next/no-img-element -- 저장 전 이미지(데이터 주소)와 저장소 이미지를 그대로 보여 주는 관리자 전용 미리보기 */

import { useState } from "react";
import { useUploads } from "@/lib/admin/uploads";

/**
 * 관리자 이미지 미리보기.
 * 방금 관리자에서 저장해 아직 이 컴퓨터의 빌드 결과에 없는 이미지는 저장소에서 바로 불러옵니다.
 */
export default function AdminImage({ src, className = "" }: { src: string; className?: string }) {
  const { resolve } = useUploads();
  const [failed, setFailed] = useState<string | null>(null);
  if (!src) return <div className={`bg-slate-100 ${className}`} />;
  const shown = failed === src ? `/api/admin/asset?src=${encodeURIComponent(src)}` : resolve(src);
  return <img src={shown} alt="" className={`object-cover ${className}`} onError={() => setFailed(src)} />;
}

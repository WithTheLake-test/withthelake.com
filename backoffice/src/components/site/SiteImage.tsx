"use client";
/* eslint-disable @next/next/no-img-element -- previews of homepage images and not-yet-saved data URLs */

import { useState } from "react";
import { homepageAsset } from "@/lib/links";
import { useUploads } from "@/lib/site/uploads";

// Images just saved are in the repository but not on the homepage until it redeploys; those load from the save API.
export default function SiteImage({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const { resolve } = useUploads();
  const [failed, setFailed] = useState<string | null>(null);
  if (!src) return <div className={`bg-soft ${className}`} />;
  const shown = failed === src ? `/api/site/asset?src=${encodeURIComponent(src)}` : homepageAsset(resolve(src));
  return <img src={shown} alt={alt} className={`object-cover ${className}`} onError={() => src.startsWith("/") && setFailed(src)} />;
}

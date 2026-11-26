"use client";
/* eslint-disable @next/next/no-img-element -- previews of homepage images and not-yet-saved data URLs */

import { homepageAsset } from "@/lib/links";
import { useUploads } from "@/lib/site/uploads";

export default function SiteImage({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  const { resolve } = useUploads();
  if (!src) return <div className={`bg-soft ${className}`} />;
  return <img src={homepageAsset(resolve(src))} alt={alt} className={`object-cover ${className}`} />;
}

import content from "@/generated/site-content.json";
import type { ImpactContent, StoryContent } from "@/generated/site-types";
import { siteApi } from "./client";

// Homepage content for the site management screens: the latest content/site-content.json on the branch.
// Without the save server (e.g. `npm run dev`), it falls back to the copy made at build time and saving is off.

export type SiteData = { story: Pick<StoryContent, "categories" | "items">; impact: ImpactContent; live: boolean };

const buildCopy = content as unknown as Omit<SiteData, "live">;

export async function loadSiteData(): Promise<SiteData> {
  try {
    const data = await siteApi<Omit<SiteData, "live">>("content");
    return { story: data.story, impact: data.impact, live: true };
  } catch {
    return { ...structuredClone(buildCopy), live: false };
  }
}

export const OFFLINE_NOTICE = "저장 서버에 연결되지 않아 빌드 시점의 내용을 보여 줍니다. 이 상태에서는 저장할 수 없습니다.";

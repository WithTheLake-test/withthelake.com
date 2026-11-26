import content from "@/generated/site-content.json";
import type { ImpactContent, StoryContent } from "@/generated/site-types";

// Homepage content for the site management screens. For now it is the content/site-content.json
// copied at build time; when saving is connected, replace this with a call to the backoffice API.

export type SiteData = { story: StoryContent; impact: ImpactContent };

const site = content as unknown as SiteData;

export async function loadSiteData(): Promise<SiteData> {
  return structuredClone(site);
}

export const SAVE_LATER = "저장 기능은 다음 단계에서 연결됩니다.";

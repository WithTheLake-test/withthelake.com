import "server-only";
import recoveredContent from "../../../content/site-content.json";
import { DEFAULT_CONTENT } from "./defaults";
import { mergeWithDefaults } from "./merge";
import type { SiteContent } from "./types";

/**
 * 콘텐츠 저장소 (정적 빌드 전용).
 * `content/site-content.json` 을 기본값(`defaults.ts`)과 병합해 빌드 시점에 읽습니다.
 * 콘텐츠를 바꾸려면 JSON 파일을 수정한 뒤 다시 빌드합니다.
 */
const content: SiteContent = mergeWithDefaults(DEFAULT_CONTENT, recoveredContent);

export async function getContent(): Promise<SiteContent> {
  return content;
}

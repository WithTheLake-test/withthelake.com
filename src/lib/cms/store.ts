import "server-only";
import fs from "node:fs";
import path from "node:path";
import recoveredContent from "../../../content/site-content.json";
import { DEFAULT_CONTENT } from "./defaults";
import { mergeWithDefaults } from "./merge";
import { STORY_DIR, parseStory, slugFromPath, sortStories } from "./story-file";
import type { SiteContent, Story } from "./types";

/**
 * 콘텐츠 저장소 (정적 빌드 전용).
 * `content/site-content.json` 을 기본값(`defaults.ts`)과 병합하고, STORY 글은 `content/story/*.md` 에서 읽습니다.
 * 콘텐츠를 바꾸려면 파일을 수정한 뒤 다시 빌드합니다.
 */
function loadStories(): Story[] {
  const dir = path.join(process.cwd(), STORY_DIR);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return sortStories(files.map((f) => parseStory(slugFromPath(f), fs.readFileSync(path.join(dir, f), "utf8"))));
}

const merged: SiteContent = mergeWithDefaults(DEFAULT_CONTENT, recoveredContent);
const content: SiteContent = { ...merged, story: { ...merged.story, items: loadStories() } };

export async function getContent(): Promise<SiteContent> {
  return content;
}

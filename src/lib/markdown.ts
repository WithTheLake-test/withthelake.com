import { marked } from "marked";

/** 줄바꿈을 그대로 살려(breaks) 기존 STORY 글의 줄 나눔과 같게 보여 줍니다. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { gfm: true, breaks: true, async: false });
}

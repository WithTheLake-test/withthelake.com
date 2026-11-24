import matter from "gray-matter";
import type { Story } from "./types";

/** STORY 글 파일 위치와 형식. 빌드(store.ts)와 관리자 API(functions/)가 같이 사용합니다. */
export const STORY_DIR = "content/story";
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DATE_PATTERN = /^\d{4}\.\d{2}\.\d{2}$/;

export const storyPath = (slug: string) => `${STORY_DIR}/${slug}.md`;
export const slugFromPath = (path: string) => path.split("/").pop()!.replace(/\.md$/, "");

export function parseStory(slug: string, raw: string): Story {
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? ""),
    category: String(data.category ?? ""),
    date: String(data.date ?? ""),
    image: String(data.image ?? ""),
    excerpt: String(data.excerpt ?? ""),
    featured: data.featured === true,
    body: content.trim(),
  };
}

/** 값을 JSON 문자열로 적어 YAML 특수문자(:, #, 따옴표)가 들어가도 깨지지 않게 합니다. */
export function serializeStory(story: Story): string {
  const lines = [
    `title: ${JSON.stringify(story.title)}`,
    `category: ${JSON.stringify(story.category)}`,
    `date: ${JSON.stringify(story.date)}`,
    `image: ${JSON.stringify(story.image)}`,
    `excerpt: ${JSON.stringify(story.excerpt)}`,
  ];
  if (story.featured) lines.push("featured: true");
  return `---\n${lines.join("\n")}\n---\n\n${story.body.trim()}\n`;
}

/** 최신 날짜가 먼저 오도록 정렬합니다. */
export function sortStories(stories: Story[]) {
  return [...stories].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** 저장 전 검증. 문제가 있으면 사용자에게 보여 줄 문구를 돌려줍니다. */
export function validateStory(story: Story, categories: string[]): string | null {
  if (!SLUG_PATTERN.test(story.slug)) return "글 주소는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  if (!story.title.trim()) return "제목을 입력해 주세요.";
  if (!categories.includes(story.category)) return "카테고리를 선택해 주세요.";
  if (!DATE_PATTERN.test(story.date)) return "날짜는 2026.11.24 형식으로 입력해 주세요.";
  if (!story.image) return "대표 이미지를 등록해 주세요.";
  if (!story.excerpt.trim()) return "요약을 입력해 주세요.";
  if (!story.body.trim()) return "본문을 입력해 주세요.";
  return null;
}

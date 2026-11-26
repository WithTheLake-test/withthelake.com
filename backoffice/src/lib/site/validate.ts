// Checks run before saving, in the browser and again in the save functions, so the homepage build never breaks.
import type { ImpactContent, Story } from "../../generated/site-types";
import { IMPACT_TABS, type FieldDef } from "./impact-schema";
import { getIn } from "./path";

export type Issues = Partial<Record<string, string>>;

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^(\d{4})\.(\d{2})\.(\d{2})$/;

export function isRealDate(value: string) {
  const m = value.match(DATE);
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

const empty = (v: unknown) => String(v ?? "").trim() === "";

// Field → message for every problem in one post. `others` are the remaining posts (for slug duplicates).
export function validatePost(post: Story, others: Story[], categories: string[]): Issues {
  const issues: Issues = {};
  if (empty(post.title)) issues.title = "제목을 입력해 주세요.";
  if (empty(post.excerpt)) issues.excerpt = "요약을 입력해 주세요.";
  if (empty(post.image)) issues.image = "대표 이미지를 선택해 주세요.";
  if (!post.body.some((b) => b.trim())) issues.body = "본문을 입력해 주세요.";
  if (!SLUG.test(post.slug)) issues.slug = "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  else if (others.some((o) => o.slug === post.slug)) issues.slug = "이미 다른 글이 쓰는 주소입니다.";
  if (!isRealDate(post.date)) issues.date = "2026.10.12처럼 실제 날짜를 YYYY.MM.DD 형식으로 입력해 주세요.";
  if (!categories.includes(post.category)) issues.category = "카테고리를 선택해 주세요.";
  return issues;
}

const missing = (fields: FieldDef[], item: unknown) =>
  fields.filter((f) => f.required && empty((item as Record<string, unknown> | undefined)?.[f.key])).map((f) => f.label);

// Human-readable list of empty required impact fields, e.g. "주요 프로젝트 3번째 프로젝트: 사진".
export function validateImpact(impact: ImpactContent): string[] {
  const problems: string[] = [];
  for (const tab of IMPACT_TABS) {
    for (const block of tab.blocks) {
      const value = getIn(impact, block.path);
      if (block.kind === "list") {
        (value as unknown[]).forEach((item, i) => {
          const labels = missing(block.fields, item);
          if (labels.length) problems.push(`${tab.label} ${i + 1}번째 ${block.itemName}: ${labels.join(", ")}`);
        });
      } else if (block.kind === "intro" || block.kind === "object") {
        const labels = missing(block.fields, value);
        if (labels.length) problems.push(`${tab.label}: ${labels.join(", ")}`);
      }
    }
  }
  return problems;
}

// The homepage shows the first 3 featured posts in list order; with fewer than 3 it shows the latest 3 instead.
export function featuredNotice(items: Story[]) {
  const featured = items.filter((s) => s.featured);
  if (featured.length < 3) return `홈 노출 글이 ${featured.length}개라서 홈에는 최신 글 3개가 대신 보입니다.`;
  if (featured.length === 3) return "홈에는 홈 노출 글 3개가 보입니다.";
  return `홈 노출 글이 ${featured.length}개입니다. 홈에는 목록 순서상 앞의 3개만 보이고 '${featured
    .slice(3)
    .map((s) => s.title)
    .join("', '")}'은(는) 보이지 않습니다.`;
}

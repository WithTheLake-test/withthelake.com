// Rules for writing one change into the latest site-content.json. Used by the save functions,
// so they use relative imports only (no "@/" alias).
import type { ImpactContent, Story } from "../../generated/site-types";
import { IMPACT_TABS } from "./impact-schema";
import { getIn, sameValue, setIn } from "./path";

export class SaveConflict extends Error {}
export class SaveInvalid extends Error {}

export type ImpactChange = { path: string; base: unknown; value: unknown };

// Keep the stored key order. Like the stored data, "featured" exists only as `true`; turning it off removes the key.
function mergePost(stored: Story, next: Story): Story {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(stored)) out[key] = next[key as keyof Story];
  for (const key of Object.keys(next)) if (!(key in out)) out[key] = next[key as keyof Story];
  if (!out.featured) delete out.featured;
  return out as Story;
}

function findBase(items: Story[], base: Story) {
  const index = items.findIndex((item) => item.slug === base.slug);
  if (index < 0) throw new SaveConflict("이 글이 삭제되었거나 주소가 바뀌었습니다. 목록을 새로고침해 주세요.");
  if (!sameValue(items[index], base)) {
    throw new SaveConflict("다른 쪽에서 이 글을 먼저 수정했습니다. 새로고침해서 최신 내용을 확인한 뒤 다시 저장해 주세요.");
  }
  return index;
}

// Replaces one post in place; its position never moves, even if the date changes.
export function updatePost(items: Story[], base: Story, next: Story): Story[] {
  const index = findBase(items, base);
  if (next.slug !== base.slug && items.some((item) => item.slug === next.slug)) {
    throw new SaveInvalid(`'${next.slug}' 주소를 이미 다른 글이 쓰고 있습니다.`);
  }
  return items.map((item, i) => (i === index ? mergePost(item, next) : item));
}

export function deletePost(items: Story[], base: Story): Story[] {
  const index = findBase(items, base);
  return items.filter((_, i) => i !== index);
}

const tabLabelOf = (path: string) => IMPACT_TABS.find((t) => t.blocks.some((b) => (b.kind === "object" && b.path === "" ? b.fields.some((f) => f.key === path) : b.path === path)))?.label ?? path;

// Writes only the changed impact paths; a path someone else changed in the meantime is not overwritten.
export function updateImpact(impact: ImpactContent, changes: ImpactChange[]): ImpactContent {
  const clashed = changes.filter((c) => !sameValue(getIn(impact, c.path), c.base));
  if (clashed.length) {
    const tabs = [...new Set(clashed.map((c) => tabLabelOf(c.path)))].join("·");
    throw new SaveConflict(`다른 쪽에서 '${tabs}' 내용을 먼저 수정했습니다. 새로고침해서 최신 내용을 확인한 뒤 다시 저장해 주세요.`);
  }
  return changes.reduce((acc, c) => setIn(acc, c.path, c.value), impact);
}

export const impactCommitMessage = (changes: ImpactChange[]) =>
  `IMPACT ${[...new Set(changes.map((c) => tabLabelOf(c.path)))].join("·")} 수정`;

// Same format as the stored file: 2-space indent, Korean as-is, trailing newline.
export const toJson = (data: unknown) => `${JSON.stringify(data, null, 2)}\n`;

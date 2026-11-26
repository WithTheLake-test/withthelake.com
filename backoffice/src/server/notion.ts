// Notion reader for the home and calendar screens (read-only; relative imports only).
// API version 2026-03-11: a database has data sources, and rows are read with POST /v1/data_sources/{id}/query.
import type { ContentItem, NotionPart, SalesItem, WorkTask } from "../lib/work/types";

export interface NotionEnv {
  NOTION_TOKEN?: string;
  NOTION_TASKS_DB?: string;
  NOTION_CONTENTS_DB?: string;
  NOTION_SALES_DB?: string;
}

const API = "https://api.notion.com/v1";
const VERSION = "2026-03-11";

// The settings may hold a Notion link or a bare ID; both contain the 32-character ID.
const idOf = (value: string) => value.replace(/-/g, "").match(/[0-9a-f]{32}/i)?.[0] ?? value;

type Property = Record<string, unknown> & { type: string };
type Page = { id: string; url: string; properties: Record<string, Property> };

// Seoul is UTC+9 all year (no daylight saving), so a fixed offset is exact.
const SEOUL_MS = 9 * 3600_000;

function seoulParts(value: string) {
  if (!value.includes("T")) return { date: value.slice(0, 10) };
  const local = new Date(new Date(value).getTime() + SEOUL_MS).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

const text = (p?: Property) =>
  ((p?.[p.type] as { plain_text: string }[] | undefined) ?? []).map((t) => t.plain_text).join("").trim();
const selectName = (p?: Property) => (p?.[p.type] as { name?: string } | null | undefined)?.name ?? undefined;
const multiNames = (p?: Property) => ((p?.multi_select as { name: string }[] | undefined) ?? []).map((o) => o.name);
const peopleNames = (p?: Property) => ((p?.people as { name?: string }[] | undefined) ?? []).map((o) => o.name ?? "").filter(Boolean);
const relationIds = (p?: Property) => ((p?.relation as { id: string }[] | undefined) ?? []).map((r) => r.id);
const dateOf = (p?: Property) => p?.date as { start: string; end: string | null } | null | undefined;

export function createNotion(env: NotionEnv) {
  const { NOTION_TOKEN: token } = env;
  if (!token || !env.NOTION_TASKS_DB || !env.NOTION_CONTENTS_DB) throw new Error("노션 설정이 없습니다.");

  async function call<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Notion ${res.status}`);
    return (await res.json()) as T;
  }

  async function rows(database: string): Promise<Page[]> {
    const db = await call<{ data_sources: { id: string }[] }>(`/databases/${idOf(database)}`);
    const source = db.data_sources[0]?.id;
    if (!source) return [];
    const out: Page[] = [];
    let cursor: string | undefined;
    do {
      const page = await call<{ results: Page[]; has_more: boolean; next_cursor: string | null }>(`/data_sources/${source}/query`, {
        page_size: 100,
        ...(cursor && { start_cursor: cursor }),
      });
      out.push(...page.results);
      cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
    } while (cursor);
    return out;
  }

  const toTask = ({ id, url, properties: p }: Page): WorkTask => {
    const date = dateOf(p["목표일정"]);
    const start = date?.start ? seoulParts(date.start) : undefined;
    return {
      id,
      url,
      title: text(p["작업명"]) || "제목 없는 업무",
      status: selectName(p["진행상태"]) ?? "",
      important: selectName(p["중요도"]) === "높음",
      kind: selectName(p["구분"]),
      category: selectName(p["카테고리"]),
      assignees: multiNames(p["담당자"]),
      start: start?.date,
      end: date?.end ? seoulParts(date.end).date : undefined,
      time: start?.time,
      parentIds: relationIds(p["상위 항목"]),
      childIds: relationIds(p["하위 항목"]),
      update: text(p["이번 주 업데이트"]) || undefined,
    };
  };

  const toContent = ({ id, url, properties: p }: Page): ContentItem => ({
    id,
    url,
    title: text(p["이름"]) || "제목 없는 콘텐츠",
    status: selectName(p["상태"]) ?? "",
    date: dateOf(p["발행일"])?.start ? seoulParts(dateOf(p["발행일"])!.start).date : undefined,
    category: selectName(p["카테고리"]),
  });

  const toSales = ({ id, url, properties: p }: Page): SalesItem => ({
    id,
    url,
    name: text(p["업체명"]) || "이름 없는 업체",
    stage: selectName(p["단계"]) ?? "",
    proposalSent: dateOf(p["제안서 발송일"])?.start?.slice(0, 10),
    nextActionDate: dateOf(p["다음 액션일"])?.start?.slice(0, 10),
    nextAction: text(p["다음 액션"]) || undefined,
    amount: (p["예상 금액"]?.number as number | null | undefined) ?? undefined,
    owners: peopleNames(p["담당자"]),
  });

  async function load(): Promise<Omit<NotionPart, "syncedAt">> {
    const [tasks, contents, sales] = await Promise.all([
      rows(env.NOTION_TASKS_DB!),
      rows(env.NOTION_CONTENTS_DB!),
      env.NOTION_SALES_DB ? rows(env.NOTION_SALES_DB) : Promise.resolve([]),
    ]);
    return { tasks: tasks.map(toTask), contents: contents.map(toContent), sales: sales.map(toSales) };
  }

  return { load };
}

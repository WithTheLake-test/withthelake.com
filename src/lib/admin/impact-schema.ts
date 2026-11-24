/**
 * 성과(IMPACT) 관리 화면 구성.
 * 탭은 헤더의 IMPACT 메뉴 순서와 같고, 각 블록이 site-content.json 의 impact 안 어느 값을 편집하는지 정의합니다.
 * 항목을 추가하거나 탭을 늘릴 때는 이 파일만 고치면 됩니다.
 */

export type FieldType = "text" | "textarea" | "number" | "image" | "images" | "strings";
export type FieldDef = { key: string; label: string; type: FieldType; required?: boolean; hint?: string };

export type Block =
  /** 섹션 제목·소개 문구 (impact.sections.*) */
  | { kind: "intro"; path: string; fields: FieldDef[] }
  /** 입력칸을 바로 보여 주는 값 묶음. path 가 "" 이면 impact 자체 */
  | { kind: "object"; path: string; title: string; fields: FieldDef[] }
  /** 항목 목록: 추가·수정(오른쪽 패널)·삭제·순서 변경 */
  | { kind: "list"; path: string; title: string; itemName: string; fields: FieldDef[]; summary: { image?: string; title: string; desc?: string } }
  /** 문자열 목록 */
  | { kind: "strings"; path: string; title: string; itemName: string }
  /** 연도별 연혁 */
  | { kind: "history"; path: string };

export type Tab = { id: string; label: string; blocks: Block[] };

const title: FieldDef = { key: "title", label: "섹션 제목", type: "text", required: true };
const lead: FieldDef = { key: "lead", label: "소개 문구", type: "textarea" };

export const IMPACT_TABS: Tab[] = [
  {
    id: "projects",
    label: "주요 프로젝트",
    blocks: [
      { kind: "intro", path: "sections.projects", fields: [title, lead] },
      {
        kind: "list",
        path: "projects",
        title: "프로젝트",
        itemName: "프로젝트",
        fields: [
          { key: "src", label: "사진", type: "image", required: true },
          { key: "title", label: "제목", type: "text", required: true },
          { key: "body", label: "설명", type: "textarea", required: true, hint: "사진 아래에 두 줄까지 표시됩니다." },
        ],
        summary: { image: "src", title: "title", desc: "body" },
      },
      {
        kind: "object",
        path: "leaderTraining",
        title: "건강리더 양성",
        fields: [
          { key: "title", label: "제목", type: "text", required: true },
          { key: "body", label: "설명", type: "textarea" },
          { key: "photos", label: "사진", type: "images", hint: "사이트에는 앞의 2장만 표시됩니다." },
        ],
      },
    ],
  },
  {
    id: "pilots",
    label: "실증 현황",
    blocks: [
      { kind: "intro", path: "sections.pilots", fields: [title, { ...lead, hint: "{year}, {target} 은 아래 실증 연도와 목표 기관 수로 바뀝니다." }] },
      {
        kind: "object",
        path: "pilots",
        title: "실증 현황",
        fields: [
          { key: "year", label: "실증 연도", type: "number", required: true },
          { key: "target", label: "목표 기관 수", type: "number", required: true },
          { key: "confirmed", label: "확정 기관", type: "strings", hint: "확정 기관 수와 진행률은 이 목록 개수로 계산됩니다." },
        ],
      },
    ],
  },
  {
    id: "rnd",
    label: "R&D · 지식재산",
    blocks: [
      { kind: "intro", path: "sections.rnd", fields: [title] },
      {
        kind: "object",
        path: "rnd",
        title: "연구개발",
        fields: [
          { key: "headline", label: "강조 수치", type: "text", required: true },
          { key: "summary", label: "요약", type: "text" },
          { key: "body", label: "설명", type: "textarea" },
          { key: "programs", label: "수행 과제", type: "strings" },
        ],
      },
      {
        kind: "list",
        path: "ip",
        title: "지식재산",
        itemName: "지식재산",
        fields: [
          { key: "label", label: "구분", type: "text", required: true },
          { key: "value", label: "상태", type: "text", required: true },
          { key: "detail", label: "상세", type: "text" },
        ],
        summary: { title: "label", desc: "value" },
      },
      { kind: "object", path: "", title: "지식재산 안내 문구", fields: [{ key: "ipNote", label: "안내 문구", type: "textarea" }] },
    ],
  },
  {
    id: "awards",
    label: "인증 · 수상 · 선정",
    blocks: [
      { kind: "intro", path: "sections.awards", fields: [title] },
      {
        kind: "list",
        path: "certs",
        title: "인증",
        itemName: "인증",
        fields: [
          { key: "name", label: "인증명", type: "text", required: true },
          { key: "short", label: "영문 표기", type: "text" },
        ],
        summary: { title: "name", desc: "short" },
      },
      { kind: "strings", path: "awards", title: "수상", itemName: "수상" },
      { kind: "strings", path: "programs", title: "선정 사업", itemName: "선정 사업" },
    ],
  },
  {
    id: "partners",
    label: "파트너",
    blocks: [
      { kind: "intro", path: "sections.partners", fields: [title, lead] },
      {
        kind: "list",
        path: "partners",
        title: "협력기관",
        itemName: "협력기관",
        fields: [
          { key: "src", label: "사진", type: "image", required: true },
          { key: "name", label: "기관명", type: "text", required: true },
          { key: "kind", label: "구분", type: "text", hint: "예: 지자체 출연기관, 요양기관, 기업" },
        ],
        summary: { image: "src", title: "name", desc: "kind" },
      },
    ],
  },
  {
    id: "history",
    label: "연혁",
    blocks: [
      { kind: "intro", path: "sections.history", fields: [title, lead] },
      { kind: "history", path: "history" },
    ],
  },
];

/** 저장하지 않은 변경 건수 계산용: 화면에서 편집하는 모든 값의 경로 */
export const EDITED_PATHS = IMPACT_TABS.flatMap((t) =>
  t.blocks.flatMap((b) => (b.kind === "object" && b.path === "" ? b.fields.map((f) => f.key) : [b.path])),
);

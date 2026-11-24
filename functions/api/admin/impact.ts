import type { ImpactContent } from "../../../src/lib/cms/types";
import { DEFAULT_CONTENT } from "../../../src/lib/cms/defaults";
import { mergeWithDefaults } from "../../../src/lib/cms/merge";
import { HttpError } from "../../../src/lib/admin/github";
import { SITE_CONTENT_PATH, handle, readBody, toJson, uploadChanges, type Upload } from "../../../src/lib/admin/server";

/** GET /api/admin/impact — IMPACT 콘텐츠(기본값 병합)와 파일 sha */
export const onRequestGet = handle(async (_ctx, gh) => {
  const file = await gh.readText(SITE_CONTENT_PATH);
  if (!file) throw new HttpError(404, "콘텐츠 파일을 찾을 수 없습니다.");
  const impact = mergeWithDefaults(DEFAULT_CONTENT.impact, JSON.parse(file.text).impact);
  return { impact, sha: file.sha };
});

/** PUT /api/admin/impact — IMPACT 부분만 바꿔 저장합니다. */
export const onRequestPut = handle(async ({ request }, gh) => {
  const { impact, sha, uploads } = await readBody<{ impact: ImpactContent; sha: string; uploads?: Upload[] }>(request);
  const file = await gh.readText(SITE_CONTENT_PATH);
  if (!file) throw new HttpError(404, "콘텐츠 파일을 찾을 수 없습니다.");
  if (file.sha !== sha) throw new HttpError(409, "다른 사람이 먼저 수정했습니다. 새로고침한 뒤 다시 저장해 주세요.");

  const text = toJson({ ...JSON.parse(file.text), impact });
  const commit = await gh.commit(
    [{ path: SITE_CONTENT_PATH, text }, ...uploadChanges(uploads, text)],
    "성과(IMPACT) 수정",
    [{ path: SITE_CONTENT_PATH, sha }],
  );
  const saved = await gh.readText(SITE_CONTENT_PATH, commit);
  return { commit, sha: saved?.sha };
});

import { handle } from "../../../src/lib/admin/server";

/** GET /api/admin/deploy-status?sha= — 커밋(없으면 최신 커밋)의 사이트 반영 상태 */
export const onRequestGet = handle(async ({ request }, gh) => {
  const sha = new URL(request.url).searchParams.get("sha") ?? undefined;
  return gh.deployState(sha);
});

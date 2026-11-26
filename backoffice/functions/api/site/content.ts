import { SITE_CONTENT_PATH, handle, type SiteFile } from "../../../src/server/respond";

// GET /api/site/content — latest story and impact from the branch, plus the commit they were read at.
export const onRequestGet = handle(async (_ctx, gh) => {
  const head = await gh.headSha();
  const site = JSON.parse(await gh.readText(SITE_CONTENT_PATH, head)) as SiteFile;
  return { story: site.story, impact: site.impact, head };
});

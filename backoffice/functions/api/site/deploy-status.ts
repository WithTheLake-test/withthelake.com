import { handle } from "../../../src/server/respond";

// GET /api/site/deploy-status?sha= — homepage build state of a commit (latest commit when omitted).
export const onRequestGet = handle(async ({ request }, gh) => gh.deployState(new URL(request.url).searchParams.get("sha") ?? undefined));

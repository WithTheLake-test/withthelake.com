import { loadWorkFeed, type WorkEnv } from "../../../src/server/work";

// GET /api/work/feed[?fresh=1] — Notion and Google Calendar data for the home and calendar screens.
// `fresh` skips the cache (the top bar's refresh button).
export async function onRequestGet({ request, env }: { request: Request; env: WorkEnv }) {
  const fresh = new URL(request.url).searchParams.has("fresh");
  return Response.json(await loadWorkFeed(env, fresh), { headers: { "Cache-Control": "no-store" } });
}

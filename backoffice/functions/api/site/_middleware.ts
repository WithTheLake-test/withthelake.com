import type { Context } from "../../../src/server/respond";

// Common gate for the save API: write requests must come from this site, and responses are never cached.
export async function onRequest({ request, next }: Context) {
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
    }
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "no-store");
  return out;
}

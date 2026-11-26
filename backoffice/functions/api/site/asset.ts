import { HttpError, createGitHub } from "../../../src/server/github";
import type { Context } from "../../../src/server/respond";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

// GET /api/site/asset?src=/uploads/a.jpg — images saved to the repository but not yet on the homepage.
export async function onRequestGet({ request, env }: Context) {
  const src = new URL(request.url).searchParams.get("src") ?? "";
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  if (!/^\/(uploads|assets)\/[\w./-]+$/.test(src) || src.includes("..") || !TYPES[ext]) return new Response("Bad Request", { status: 400 });
  try {
    const body = await createGitHub(env).readRaw(`public${src}`);
    return new Response(body, { headers: { "Content-Type": TYPES[ext], "Cache-Control": "private, max-age=300" } });
  } catch (e) {
    return new Response(e instanceof HttpError ? e.message : "Error", { status: e instanceof HttpError ? e.status : 500 });
  }
}

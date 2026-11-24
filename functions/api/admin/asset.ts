import { HttpError, createGitHub } from "../../../src/lib/admin/github";
import type { AdminContext } from "../../../src/lib/admin/server";

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

/**
 * GET /api/admin/asset?src=/uploads/a.jpg
 * 관리자에서 저장했지만 아직 이 컴퓨터(빌드 결과)에 없는 이미지를 저장소에서 바로 보여 줍니다.
 */
export async function onRequestGet({ request, env }: AdminContext) {
  const src = new URL(request.url).searchParams.get("src") ?? "";
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  if (!/^\/(uploads|assets)\/[\w./-]+$/.test(src) || src.includes("..") || !TYPES[ext]) {
    return new Response("Bad Request", { status: 400 });
  }
  try {
    const body = await createGitHub(env).readRaw(`public${src}`);
    return new Response(body, { headers: { "Content-Type": TYPES[ext], "Cache-Control": "private, max-age=300" } });
  } catch (e) {
    return new Response(e instanceof HttpError ? e.message : "Error", { status: e instanceof HttpError ? e.status : 500 });
  }
}

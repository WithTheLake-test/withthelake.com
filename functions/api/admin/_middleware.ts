import type { AdminContext } from "../../../src/lib/admin/server";

/**
 * 관리자 API 공통 관문.
 * - ADMIN_ENABLED=true 인 환경(로컬 .dev.vars)에서만 동작하고, 운영 배포에서는 404 를 돌려줍니다.
 * - 저장 요청은 같은 사이트에서 보낸 것만 받습니다.
 * 관리자 암호는 이후 이 파일에서 함께 확인합니다.
 */
export async function onRequest({ request, env, next }: AdminContext) {
  if (env.ADMIN_ENABLED !== "true") return new Response("Not Found", { status: 404 });

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

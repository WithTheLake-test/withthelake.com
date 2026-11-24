import { HttpError, createGitHub, type FileChange, type GitHub, type GitHubEnv } from "./github";

/** 관리자 Pages Function 공통 처리: 응답 형식, 오류 변환, 업로드 검증 */

export interface AdminEnv extends GitHubEnv {
  ADMIN_ENABLED?: string;
}

export type AdminContext = { request: Request; env: AdminEnv; next: () => Promise<Response> };

export function handle(fn: (ctx: AdminContext, gh: GitHub) => Promise<unknown>) {
  return async (ctx: AdminContext) => {
    try {
      return Response.json(await fn(ctx, createGitHub(ctx.env)));
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      console.error("[admin]", e);
      return Response.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
    }
  };
}

export async function readBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "잘못된 요청입니다.");
  }
}

export type Upload = { path: string; base64: string };

const UPLOAD_PATH = /^public\/uploads\/[a-z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** 새로 올린 이미지 중 저장할 내용에서 실제로 사용하는 것만 커밋합니다. */
export function uploadChanges(uploads: Upload[] | undefined, usedIn: string): FileChange[] {
  return (uploads ?? [])
    .filter((u) => usedIn.includes(u.path.replace(/^public/, "")))
    .map((u) => {
      if (!UPLOAD_PATH.test(u.path)) throw new HttpError(400, "이미지 경로가 올바르지 않습니다.");
      if (u.base64.length * 0.75 > MAX_UPLOAD_BYTES) throw new HttpError(400, "이미지는 5MB 이하만 올릴 수 있습니다.");
      return { path: u.path, base64: u.base64 };
    });
}

export const SITE_CONTENT_PATH = "content/site-content.json";
export const toJson = (data: unknown) => `${JSON.stringify(data, null, 2)}\n`;

/** STORY 카테고리 목록 (site-content.json 의 story.categories) */
export async function readCategories(gh: GitHub): Promise<string[]> {
  const site = await gh.readText(SITE_CONTENT_PATH);
  return site ? JSON.parse(site.text).story?.categories ?? [] : [];
}

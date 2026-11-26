import type { Story } from "../generated/site-types";
import { SaveConflict, SaveInvalid, toJson } from "../lib/site/merge";
import { BranchMoved, HttpError, createGitHub, type Env, type FileChange, type GitHub } from "./github";

// Shared handling for the save functions: JSON responses, error mapping, uploads and the save loop.

export type Context = { request: Request; env: Env; next: () => Promise<Response> };

export function handle(fn: (ctx: Context, gh: GitHub) => Promise<unknown>) {
  return async (ctx: Context) => {
    try {
      return Response.json(await fn(ctx, createGitHub(ctx.env)));
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      if (e instanceof SaveConflict) return Response.json({ error: e.message, conflict: true }, { status: 409 });
      if (e instanceof SaveInvalid) return Response.json({ error: e.message }, { status: 400 });
      console.error("[site]", e);
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

export const SITE_CONTENT_PATH = "content/site-content.json";

export type SiteFile = { story: { categories: string[]; items: Story[] }; impact: Record<string, unknown> } & Record<string, unknown>;

export type Upload = { path: string; base64: string };

const UPLOAD_PATH = /^public\/uploads\/\d{8}-[a-z0-9-]+\.jpg$/;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Only images actually used in the saved file are committed.
function uploadChanges(uploads: Upload[] | undefined, usedIn: string): FileChange[] {
  return (uploads ?? [])
    .filter((u) => usedIn.includes(u.path.replace(/^public/, "")))
    .map((u) => {
      if (!UPLOAD_PATH.test(u.path)) throw new HttpError(400, "사진 경로가 올바르지 않습니다.");
      if (u.base64.length * 0.75 > MAX_UPLOAD_BYTES) throw new HttpError(400, "사진은 5MB 이하만 올릴 수 있습니다.");
      return { path: u.path, base64: u.base64 };
    });
}

const MAX_ATTEMPTS = 3;

// Reads the latest file, applies one change and commits; if another commit lands in between, starts over.
export async function saveSiteContent(gh: GitHub, apply: (site: SiteFile) => { site: SiteFile; message: string }, uploads?: Upload[]) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const head = await gh.headSha();
    const before = await gh.readText(SITE_CONTENT_PATH, head);
    const { site, message } = apply(JSON.parse(before) as SiteFile);
    const text = toJson(site);
    if (text === before) return { commit: null };
    try {
      return { commit: await gh.commit(head, [{ path: SITE_CONTENT_PATH, text }, ...uploadChanges(uploads, text)], message) };
    } catch (e) {
      if (!(e instanceof BranchMoved)) throw e;
    }
  }
  throw new HttpError(409, "저장하는 사이 다른 변경이 계속 들어와 저장하지 못했습니다. 잠시 후 다시 저장해 주세요.");
}

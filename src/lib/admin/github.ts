/**
 * 관리자 저장소 연동 (Cloudflare Pages Function 전용).
 * 콘텐츠 파일을 GitHub 저장소에서 읽고, 여러 파일 변경을 커밋 하나로 올립니다.
 * 커밋이 올라가면 Cloudflare Pages 가 자동으로 다시 빌드합니다.
 */

export interface GitHubEnv {
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string; // "owner/name"
  GITHUB_BRANCH?: string;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const conflictError = () =>
  new HttpError(409, "다른 사람이 먼저 수정했습니다. 새로고침한 뒤 다시 저장해 주세요.");

export type FileChange =
  | { path: string; text: string }
  | { path: string; base64: string }
  | { path: string; delete: true };

/** 저장 직전 파일 상태 확인용. sha 가 null 이면 '아직 없는 파일'이어야 합니다. */
export type Expectation = { path: string; sha: string | null };

const API = "https://api.github.com";

export function createGitHub(env: GitHubEnv) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo, GITHUB_BRANCH: branch } = env;
  if (!token || !repo || !branch) {
    throw new HttpError(500, "GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH 환경변수를 설정해 주세요.");
  }

  async function call<T>(path: string, init: RequestInit & { accept?: string } = {}): Promise<T> {
    const res = await fetch(`${API}/repos/${repo}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: init.accept ?? "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "withthelake-admin",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (res.status === 404) throw new HttpError(404, "파일을 찾을 수 없습니다.");
    if (res.status === 409 || (res.status === 422 && path.startsWith("/git/refs"))) throw conflictError();
    if (!res.ok) throw new HttpError(502, `GitHub 요청 실패 (HTTP ${res.status})`);
    return (init.accept?.includes("raw") ? res.arrayBuffer() : res.json()) as Promise<T>;
  }

  const post = <T>(path: string, body: unknown) => call<T>(path, { method: "POST", body: JSON.stringify(body) });

  async function headSha() {
    const ref = await call<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    return ref.object.sha;
  }

  /** 파일 내용과 sha. 없으면 null */
  async function readText(path: string, ref = branch!): Promise<{ text: string; sha: string } | null> {
    try {
      const file = await call<{ content: string; sha: string }>(`/contents/${encodePath(path)}?ref=${ref}`);
      return { text: decodeBase64Utf8(file.content), sha: file.sha };
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) return null;
      throw e;
    }
  }

  async function readRaw(path: string) {
    return call<ArrayBuffer>(`/contents/${encodePath(path)}?ref=${branch}`, { accept: "application/vnd.github.raw+json" });
  }

  async function listDir(path: string) {
    try {
      const items = await call<{ name: string; path: string; sha: string; type: string }[]>(`/contents/${encodePath(path)}?ref=${branch}`);
      return items.filter((i) => i.type === "file");
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) return [];
      throw e;
    }
  }

  /** 변경 파일들을 커밋 하나로 올리고 커밋 sha 를 돌려줍니다. */
  async function commit(changes: FileChange[], message: string, expect: Expectation[] = []) {
    const parent = await headSha();

    for (const e of expect) {
      const current = await readText(e.path, parent);
      if ((current?.sha ?? null) !== e.sha) throw conflictError();
    }

    const { tree: baseTree } = await call<{ tree: { sha: string } }>(`/git/commits/${parent}`);
    const tree = await Promise.all(
      changes.map(async (c) => {
        if ("delete" in c) return { path: c.path, mode: "100644", type: "blob", sha: null };
        const blob = await post<{ sha: string }>(
          "/git/blobs",
          "text" in c ? { content: c.text, encoding: "utf-8" } : { content: c.base64, encoding: "base64" },
        );
        return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );
    const newTree = await post<{ sha: string }>("/git/trees", { base_tree: baseTree.sha, tree });
    const created = await post<{ sha: string }>("/git/commits", { message, tree: newTree.sha, parents: [parent] });
    await call(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: created.sha, force: false }) });
    return created.sha;
  }

  /** 커밋의 Cloudflare Pages 빌드 상태 */
  async function deployState(sha?: string) {
    const target = sha ?? (await headSha());
    const [checks, statuses, info] = await Promise.all([
      call<{ check_runs: { status: string; conclusion: string | null; details_url: string | null }[] }>(`/commits/${target}/check-runs`).catch(() => ({ check_runs: [] })),
      call<{ statuses: { state: string; target_url: string | null }[] }>(`/commits/${target}/status`).catch(() => ({ statuses: [] })),
      call<{ commit: { committer: { date: string }; message: string } }>(`/commits/${target}`),
    ]);
    const states: DeployState[] = [
      ...checks.check_runs.map((c) => (c.status !== "completed" ? "building" : c.conclusion === "success" ? "success" : "failure") as DeployState),
      ...statuses.statuses.map((s) => (s.state === "pending" ? "building" : s.state === "success" ? "success" : "failure") as DeployState),
    ];
    const state: DeployState = states.length === 0 ? "unknown" : states.includes("failure") ? "failure" : states.includes("building") ? "building" : "success";
    return { sha: target, state, committedAt: info.commit.committer.date, message: info.commit.message };
  }

  return { readText, readRaw, listDir, commit, deployState };
}

export type DeployState = "building" | "success" | "failure" | "unknown";
export type GitHub = ReturnType<typeof createGitHub>;

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

function decodeBase64Utf8(b64: string) {
  const bin = atob(b64.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

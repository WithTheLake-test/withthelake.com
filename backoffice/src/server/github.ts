// GitHub access for the save functions (Cloudflare Pages Functions only; relative imports only).
// Reads files from the branch and writes several file changes as one commit.

export interface Env {
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

// The branch moved after we read it; the caller re-reads and tries again.
export class BranchMoved extends Error {}

export type FileChange = { path: string; text: string } | { path: string; base64: string };

export type DeployState = "building" | "success" | "failure" | "unknown";

const API = "https://api.github.com";
// Build check written by the homepage Pages project on each commit.
const HOMEPAGE_CHECK = "withthelake-test";

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

function decodeBase64Utf8(b64: string) {
  const bin = atob(b64.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function createGitHub(env: Env) {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo, GITHUB_BRANCH: branch } = env;
  if (!token || !repo || !branch) throw new HttpError(500, "저장 설정(GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH)이 없습니다.");

  async function call(path: string, init: RequestInit & { accept?: string } = {}) {
    const res = await fetch(`${API}/repos/${repo}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: init.accept ?? "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "withthelake-backoffice",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (res.status === 404) throw new HttpError(404, "저장소에서 파일을 찾을 수 없습니다.");
    if (res.status === 401 || res.status === 403) throw new HttpError(502, "GitHub 토큰 권한을 확인해 주세요.");
    return res;
  }

  const json = async <T>(path: string, init?: RequestInit) => {
    const res = await call(path, init);
    if (!res.ok) throw new HttpError(502, `GitHub 요청 실패 (HTTP ${res.status})`);
    return (await res.json()) as T;
  };
  const post = <T>(path: string, body: unknown) => json<T>(path, { method: "POST", body: JSON.stringify(body) });

  async function headSha() {
    const ref = await json<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    return ref.object.sha;
  }

  async function readText(path: string, ref: string) {
    const file = await json<{ content: string; sha: string }>(`/contents/${encodePath(path)}?ref=${ref}`);
    return decodeBase64Utf8(file.content);
  }

  async function readRaw(path: string) {
    const res = await call(`/contents/${encodePath(path)}?ref=${branch}`, { accept: "application/vnd.github.raw+json" });
    if (!res.ok) throw new HttpError(502, `GitHub 요청 실패 (HTTP ${res.status})`);
    return res.arrayBuffer();
  }

  // One commit on top of `parent`. Throws BranchMoved if the branch is no longer at `parent`.
  async function commit(parent: string, changes: FileChange[], message: string) {
    const { tree: baseTree } = await json<{ tree: { sha: string } }>(`/git/commits/${parent}`);
    const tree = await Promise.all(
      changes.map(async (c) => {
        const blob = await post<{ sha: string }>("/git/blobs", "text" in c ? { content: c.text, encoding: "utf-8" } : { content: c.base64, encoding: "base64" });
        return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
      }),
    );
    const newTree = await post<{ sha: string }>("/git/trees", { base_tree: baseTree.sha, tree });
    const created = await post<{ sha: string }>("/git/commits", { message, tree: newTree.sha, parents: [parent] });
    const res = await call(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: created.sha, force: false }) });
    if (res.status === 422 || res.status === 409) throw new BranchMoved();
    if (!res.ok) throw new HttpError(502, `GitHub 요청 실패 (HTTP ${res.status})`);
    return created.sha;
  }

  // Homepage build state of a commit (latest commit on the branch when no sha is given).
  async function deployState(sha?: string) {
    const target = sha ?? (await headSha());
    const [checks, info] = await Promise.all([
      json<{ check_runs: { name: string; status: string; conclusion: string | null; details_url: string | null }[] }>(`/commits/${target}/check-runs`).catch(
        () => ({ check_runs: [] }),
      ),
      json<{ html_url: string; commit: { committer: { date: string }; message: string } }>(`/commits/${target}`),
    ]);
    const run = checks.check_runs.find((c) => c.name.includes(HOMEPAGE_CHECK));
    const state: DeployState = !run ? "unknown" : run.status !== "completed" ? "building" : run.conclusion === "success" ? "success" : "failure";
    return {
      sha: target,
      state,
      committedAt: info.commit.committer.date,
      message: info.commit.message.split("\n")[0],
      commitUrl: info.html_url,
      detailsUrl: run?.details_url ?? null,
    };
  }

  return { headSha, readText, readRaw, commit, deployState };
}

export type GitHub = ReturnType<typeof createGitHub>;

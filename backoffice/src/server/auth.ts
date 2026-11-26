// Backoffice access password (Pages Functions only; relative imports only).
// The session cookie holds an issue time and its signature, never the password. It is re-issued on every
// request, so it expires after 30 minutes without use; being a session cookie, closing the browser drops it too.

export interface AuthEnv {
  ADMIN_PASSWORD?: string;
}

export const IDLE_MS = 30 * 60_000;
export const MAX_FAILS = 5;
export const LOCK_MS = 60_000;
export const FAIL_DELAY_MS = 1500;

const SESSION = "bo_session";
const FAILS = "bo_fail";
const encoder = new TextEncoder();

async function sign(password: string, data: string) {
  // Keyed by the password, so changing ADMIN_PASSWORD signs everyone out.
  const key = await crypto.subtle.importKey("raw", encoder.encode(`backoffice:${password}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Compares signatures instead of the raw strings, so the timing does not reveal the password.
export async function passwordMatches(password: string, input: string) {
  return sameText(await sign(password, `pw:${input}`), await sign(password, `pw:${password}`));
}

export function readCookies(request: Request) {
  const out: Record<string, string> = {};
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

const cookie = (name: string, value: string) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict`;
const clearCookie = (name: string) => `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function sessionCookie(password: string, now: number) {
  return cookie(SESSION, `${now}.${await sign(password, `session:${now}`)}`);
}

export async function hasSession(password: string, request: Request, now: number) {
  const [issued, signature] = (readCookies(request)[SESSION] ?? "").split(".");
  const at = Number(issued);
  if (!signature || !Number.isFinite(at) || at > now + 60_000 || now - at > IDLE_MS) return false;
  return sameText(signature, await sign(password, `session:${issued}`));
}

// Wrong-password count and lock time, kept in a signed session cookie.
export type Fails = { count: number; lockedUntil: number };

export async function readFails(password: string, request: Request): Promise<Fails> {
  const [count, lockedUntil, signature] = (readCookies(request)[FAILS] ?? "").split(".");
  if (!signature || !sameText(signature, await sign(password, `fail:${count}.${lockedUntil}`))) return { count: 0, lockedUntil: 0 };
  return { count: Number(count) || 0, lockedUntil: Number(lockedUntil) || 0 };
}

export async function failsCookie(password: string, fails: Fails) {
  const value = `${fails.count}.${fails.lockedUntil}`;
  return cookie(FAILS, `${value}.${await sign(password, `fail:${value}`)}`);
}

export const clearFailsCookie = () => clearCookie(FAILS);

// Only same-site paths are followed after signing in.
export function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\") || next.startsWith("/login")) return "/";
  return next;
}

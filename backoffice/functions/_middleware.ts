import {
  FAIL_DELAY_MS,
  LOCK_MS,
  MAX_FAILS,
  clearFailsCookie,
  failsCookie,
  hasSession,
  passwordMatches,
  readFails,
  safeNext,
  sessionCookie,
  type AuthEnv,
} from "../src/server/auth";
import { loginPage, type LoginState } from "../src/server/login-page";

type Context = { request: Request; env: AuthEnv; next: () => Promise<Response> };

// Every request (screens, save API, static files) passes this gate first.

const page = (state: LoginState, status: number, next?: string, cookies: string[] = []) => {
  const headers = new Headers({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Frame-Options": "DENY" });
  cookies.forEach((c) => headers.append("Set-Cookie", c));
  return new Response(loginPage(state, next), { status, headers });
};

const redirect = (location: string, cookies: string[] = []) => {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  cookies.forEach((c) => headers.append("Set-Cookie", c));
  return new Response(null, { status: 303, headers });
};

const secondsLeft = (lockedUntil: number, now: number) => Math.max(1, Math.ceil((lockedUntil - now) / 1000));

async function login(request: Request, password: string) {
  const url = new URL(request.url);
  const now = Date.now();
  const fails = await readFails(password, request);

  if (request.method !== "POST") {
    if (await hasSession(password, request, now)) return redirect(safeNext(url.searchParams.get("next")));
    const next = safeNext(url.searchParams.get("next"));
    return fails.lockedUntil > now ? page({ kind: "locked", seconds: secondsLeft(fails.lockedUntil, now) }, 429, next) : page({ kind: "default" }, 200, next);
  }

  const form = await request.formData().catch(() => null);
  const next = safeNext(String(form?.get("next") ?? ""));
  if (fails.lockedUntil > now) return page({ kind: "locked", seconds: secondsLeft(fails.lockedUntil, now) }, 429, next);

  if (await passwordMatches(password, String(form?.get("password") ?? ""))) {
    return redirect(next, [await sessionCookie(password, now), clearFailsCookie()]);
  }

  await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
  const count = fails.count + 1;
  if (count >= MAX_FAILS) {
    const lockedUntil = Date.now() + LOCK_MS;
    return page({ kind: "locked", seconds: secondsLeft(lockedUntil, Date.now()) }, 429, next, [await failsCookie(password, { count: 0, lockedUntil })]);
  }
  return page({ kind: "wrong" }, 401, next, [await failsCookie(password, { count, lockedUntil: 0 })]);
}

export async function onRequest({ request, env, next }: Context) {
  const url = new URL(request.url);
  // The password screen uses the site font; font files are public anyway.
  if (url.pathname.startsWith("/fonts/")) return next();

  const password = env.ADMIN_PASSWORD;
  if (!password) return page({ kind: "missing" }, 503);
  if (url.pathname === "/login") return login(request, password);

  const now = Date.now();
  if (await hasSession(password, request, now)) {
    const res = await next();
    const out = new Response(res.body, res);
    // Each use starts the 30 minutes again.
    out.headers.append("Set-Cookie", await sessionCookie(password, now));
    return out;
  }

  const wantsPage = request.method === "GET" && (request.headers.get("Accept") ?? "").includes("text/html") && !url.pathname.startsWith("/api/");
  if (wantsPage) return redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  return url.pathname.startsWith("/api/")
    ? Response.json({ error: "접근 암호를 다시 입력해 주세요." }, { status: 401, headers: { "Cache-Control": "no-store" } })
    : new Response("Unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
}

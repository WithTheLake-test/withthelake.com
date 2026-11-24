/**
 * CONTACT US 문의 접수 — Cloudflare Pages Function (POST /api/contact).
 * 정적 전환 전 Next.js Route Handler(docs/legacy/api-contact-route.ts)의 검증 · 메일 형식 · 응답을 그대로 옮겼습니다.
 *
 * 환경변수 (Cloudflare Pages → Settings → Variables and Secrets, 로컬은 .dev.vars):
 * - RESEND_API_KEY      (Secret) Resend API 키
 * - CONTACT_TO_EMAIL    수신 주소, 쉼표로 여러 개 지정 가능
 * - CONTACT_FROM_EMAIL  Resend 에서 인증한 도메인의 발신 주소
 * RESEND_API_KEY 또는 CONTACT_TO_EMAIL 이 없으면 503 을 반환합니다.
 */
import siteContent from "../../content/site-content.json";
import { DEFAULT_CONTENT } from "../../src/lib/cms/defaults";
import { mergeWithDefaults } from "../../src/lib/cms/merge";

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type ContactPayload = {
  company: string;
  department?: string;
  position?: string;
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  message: string;
  agree: boolean;
  website?: string; // honeypot
};

// 사이트와 같은 방식(기본값 병합)으로 문의 유형 목록을 읽습니다.
const { contact } = mergeWithDefaults(DEFAULT_CONTENT, siteContent);

function json(body: { ok: boolean; error?: string }, status = 200) {
  return Response.json(body, { status });
}

function clean(v: unknown, max = 500) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/**
 * 접수 내용 전달.
 * RESEND_API_KEY + CONTACT_TO_EMAIL 이 설정되면 Resend API로 메일을 보냅니다.
 * 발송 설정이 완료된 경우에만 접수 성공을 반환합니다.
 */
async function deliver(p: ContactPayload, env: Env) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL ?? "WITH THE LAKE <noreply@withthelake.com>";

  const receivedAt = new Date().toISOString();
  if (!apiKey || !to) return false;

  const rows: [string, string][] = [
    ["문의 유형", p.inquiryType],
    ["회사명", p.company],
    ["부서", p.department ?? ""],
    ["직책", p.position ?? ""],
    ["담당자", p.name],
    ["연락처", p.phone],
    ["이메일", p.email],
    ["접수 시각", receivedAt],
  ];
  const html = `
    <h2 style="font-family:sans-serif">[홈페이지 문의] ${escapeHtml(p.inquiryType)} · ${escapeHtml(p.company)}</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><th align="left" style="padding:6px 12px 6px 0;color:#555">${k}</th><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <h3 style="font-family:sans-serif;margin-top:20px">요청 내용</h3>
    <p style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(p.message)}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: p.email,
      subject: `[홈페이지 문의] ${p.inquiryType} · ${p.company} · ${p.name}`,
      html,
    }),
  });
  if (!res.ok) {
    throw new Error(`메일 전송 실패 (HTTP ${res.status})`);
  }
  return true;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  let raw: Partial<ContactPayload>;
  try {
    raw = (await request.json()) as Partial<ContactPayload>;
  } catch {
    return json({ ok: false, error: "잘못된 요청입니다." }, 400);
  }
  if (!raw || typeof raw !== "object") return json({ ok: false, error: "잘못된 요청입니다." }, 400);

  // 봇 차단: 숨은 필드가 채워져 있으면 조용히 성공 처리
  if (clean(raw.website)) return json({ ok: true });

  const payload: ContactPayload = {
    company: clean(raw.company, 120),
    department: clean(raw.department, 120),
    position: clean(raw.position, 120),
    name: clean(raw.name, 60),
    phone: clean(raw.phone, 40),
    email: clean(raw.email, 120),
    inquiryType: clean(raw.inquiryType, 40),
    message: clean(raw.message, 4000),
    agree: raw.agree === true,
  };

  if (!payload.company || !payload.name || !payload.phone || !payload.email || !payload.message) {
    return json({ ok: false, error: "필수 항목을 모두 입력해 주세요." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return json({ ok: false, error: "이메일 형식을 확인해 주세요." }, 400);
  }
  if (!contact.form.inquiryTypes.includes(payload.inquiryType)) {
    return json({ ok: false, error: "문의 유형을 선택해 주세요." }, 400);
  }
  if (!payload.agree) {
    return json({ ok: false, error: "개인정보 수집 및 이용에 동의해 주세요." }, 400);
  }

  try {
    if (!(await deliver(payload, env))) {
      return json({ ok: false, error: "문의 메일 연결을 준비하고 있습니다. 안내된 이메일로 직접 문의해 주세요." }, 503);
    }
  } catch (err) {
    console.error("[CONTACT US] 전달 실패", err);
    return json({ ok: false, error: "접수 처리 중 오류가 발생했습니다. 이메일로 직접 문의해 주세요." }, 502);
  }

  return json({ ok: true });
}

// Password screen, served directly by the middleware (the Next.js pages are behind the gate themselves).

export type LoginState = { kind: "default" } | { kind: "wrong" } | { kind: "locked"; seconds: number } | { kind: "missing" };

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const CSS = `*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;color:#111827;font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-size:14.5px;-webkit-font-smoothing:antialiased}
main{width:100%;max-width:400px;padding:0 16px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:36px 32px}
.brand{font-size:16px;font-weight:800;letter-spacing:.04em}.sub{margin-top:2px;font-size:14px;color:#6b7280}
h1{margin:28px 0 6px;font-size:22px;font-weight:700}p.lead{margin:0;color:#6b7280;line-height:1.6}
label{display:block;margin:24px 0 6px;font-weight:600}
input{width:100%;height:42px;padding:0 12px;border:1px solid #e5e7eb;border-radius:8px;font:inherit;outline:none}input:focus{border-color:#111827}input[aria-invalid=true]{border-color:#dc2626}
.msg{margin:8px 0 0;font-size:14px;color:#dc2626;line-height:1.5}
button{margin-top:20px;width:100%;height:42px;border:0;border-radius:8px;background:#111827;color:#fff;font:inherit;font-weight:600;cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}
.foot{margin-top:16px;text-align:center;font-size:13px;color:#9ca3af}
.notice{margin-top:24px;padding:14px 16px;border:1px solid rgba(220,38,38,.4);border-radius:8px;color:#dc2626;line-height:1.6}`;

// Counts down the lock and re-enables the form without a reload.
const COUNTDOWN = `<script>(function(){var el=document.getElementById("wait"),left=Number(el.dataset.seconds);var t=setInterval(function(){left-=1;if(left>0){el.querySelector("b").textContent=left;return}clearInterval(t);el.remove();var i=document.getElementById("password"),b=document.querySelector("button");i.disabled=false;i.setAttribute("aria-invalid","false");b.disabled=false;i.focus()},1000)})()</script>`;

function form(state: LoginState, next: string) {
  const locked = state.kind === "locked";
  const invalid = state.kind === "wrong" || locked;
  const message =
    state.kind === "wrong"
      ? `<p class="msg">암호가 맞지 않습니다.</p>`
      : locked
        ? `<p class="msg" id="wait" data-seconds="${state.seconds}">암호를 ${5}번 잘못 입력했습니다. 다시 시도까지 <b>${state.seconds}</b>초</p>`
        : "";
  const off = locked ? " disabled" : "";
  return `<p class="lead">접근 암호를 입력해 주세요.</p>
<form method="post" action="/login"><input type="hidden" name="next" value="${escapeHtml(next)}">
<label for="password">암호</label><input id="password" name="password" type="password" autocomplete="current-password" autofocus aria-invalid="${invalid}"${off}>${message}
<button type="submit"${off}>들어가기</button></form>${locked ? COUNTDOWN : ""}`;
}

export function loginPage(state: LoginState, next = "/") {
  const body =
    state.kind === "missing"
      ? `<div class="notice">접근 암호가 설정되지 않아 들어갈 수 없습니다. 관리자에게 문의해 주세요.</div>`
      : form(state, next);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>접근 암호 | 위드더레이크 업무 관리</title><link rel="stylesheet" href="/fonts/pretendard/pretendard.css"><style>${CSS}</style></head>
<body><main><div class="card"><div class="brand">WITH THE LAKE</div><div class="sub">업무 관리</div><h1>접근 암호</h1>${body}</div>
<p class="foot">브라우저를 닫거나 30분 동안 사용하지 않으면 다시 암호를 묻습니다.</p></main></body></html>`;
}

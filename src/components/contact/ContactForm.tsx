"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ContactContent } from "@/lib/cms/types";

/** ?type= 쿼리로 문의 유형을 미리 선택할 수 있습니다 (예: /contact?type=senio). 값은 유형 목록의 순서와 짝지어집니다. */
const TYPE_ALIAS = ["business", "senio", "program", "product", "other"];

type Status = "idle" | "submitting" | "success" | "compose" | "error";

const inputClass =
  "w-full min-h-12 rounded-xl border border-line bg-white px-4 text-[16px] text-ink placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass = "mb-2 block text-[15px] font-semibold text-ink";

function Req() {
  return (
    <span className="text-accent-deep" aria-hidden>
      {" "}
      *
    </span>
  );
}

type Props = { email: string; form: ContactContent["form"] };

/**
 * 정적 export 에서 useSearchParams 는 Suspense 경계까지 클라이언트 렌더링으로 전환됩니다.
 * fallback 으로 유형 미선택 폼을 렌더링해 정적 HTML 에 폼이 포함되도록 하고,
 * 하이드레이션 후 ?type= 값으로 문의 유형을 미리 선택합니다.
 */
export default function ContactForm(props: Props) {
  return (
    <Suspense fallback={<ContactFormBody {...props} preset="" />}>
      <ContactFormWithParams {...props} />
    </Suspense>
  );
}

function ContactFormWithParams(props: Props) {
  const params = useSearchParams();
  const aliasIndex = TYPE_ALIAS.indexOf(params.get("type") ?? "");
  const preset = aliasIndex >= 0 ? (props.form.inquiryTypes[aliasIndex] ?? "") : "";
  return <ContactFormBody {...props} preset={preset} />;
}

function ContactFormBody({ email, form, preset }: Props & { preset: string }) {
  const types = form.inquiryTypes;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    if (process.env.NEXT_PUBLIC_PREVIEW_ONLY === "true") {
      setErrorMessage("미리보기입니다. 입력한 문의는 전송되지 않았습니다.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    const data = new FormData(formEl);
    const payload = {
      company: data.get("company"),
      department: data.get("department"),
      position: data.get("position"),
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      inquiryType: data.get("inquiryType"),
      message: data.get("message"),
      agree: data.get("agree") === "on",
      website: data.get("website"), // honeypot
    };

    // 정적 호스팅(GitHub Pages 등)에서는 API 가 없으므로 메일 앱으로 내용을 전달합니다.
    const fallbackMailto = () => {
      const lines = [
        `문의 유형: ${payload.inquiryType}`,
        `회사명: ${payload.company}`,
        `부서/직책: ${payload.department || "-"} / ${payload.position || "-"}`,
        `담당자: ${payload.name}`,
        `연락처: ${payload.phone}`,
        `이메일: ${payload.email}`,
        "",
        String(payload.message ?? ""),
      ];
      const url = `mailto:${email}?subject=${encodeURIComponent(`[홈페이지 문의] ${payload.inquiryType} · ${payload.company}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
      window.location.href = url;
      setStatus("compose");
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 404 || res.status === 405) return fallbackMailto();
      const result = await res.json().catch(() => null);
      if (!result) return fallbackMailto();

      if (!res.ok || !result.ok) {
        setErrorMessage(result.error ?? "문의 접수 중 오류가 발생했습니다.");
        setStatus("error");
        return;
      }

      setStatus("success");
      formEl.reset();
    } catch {
      fallbackMailto();
    }
  }

  if (status === "success" || status === "compose") {
    return (
      <div className="rounded-2xl bg-primary-light p-10 text-center" role="status">
        <p className="eyebrow text-accent-deep">{status === "success" ? "접수 완료" : "이메일 문의"}</p>
        <h2 className="t-h3 mt-3 text-primary">{status === "success" ? form.successTitle : "메일 앱에서 전송을 완료해 주세요"}</h2>
        <p className="t-body mt-3 text-ink-2">{status === "success" ? form.successBody : `메일 앱이 열리지 않으면 ${email}로 직접 문의해 주세요.`}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-primary px-6 text-[15px] font-semibold text-primary hover:bg-white"
        >
          새 문의 작성하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            회사명 <Req />
          </label>
          <input id="company" name="company" required autoComplete="organization" className={inputClass} />
        </div>
        <div>
          <label htmlFor="department" className={labelClass}>부서</label>
          <input id="department" name="department" className={inputClass} />
        </div>
        <div>
          <label htmlFor="position" className={labelClass}>직책</label>
          <input id="position" name="position" autoComplete="organization-title" className={inputClass} />
        </div>
        <div>
          <label htmlFor="name" className={labelClass}>
            담당자 이름 <Req />
          </label>
          <input id="name" name="name" required autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            연락처 <Req />
          </label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="010-0000-0000" className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            이메일 <Req />
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className={labelClass}>
          문의 유형 <Req />
        </label>
        <select id="inquiryType" name="inquiryType" required className={inputClass} defaultValue={preset}>
          <option value="" disabled>
            선택해 주세요
          </option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          요청 내용 <Req />
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          placeholder={form.placeholder}
          className={`${inputClass} min-h-0 py-3`}
        />
      </div>

      {/* honeypot — 사람은 보지 못하는 필드 */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-cream p-5">
        <input id="agree" name="agree" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-primary" />
        <label htmlFor="agree" className="text-[15px] leading-6 text-ink-2">
          개인정보 수집 및 이용에 동의합니다. 수집 항목과 이용 목적은{" "}
          <Link href="/privacy" className="font-semibold text-primary underline underline-offset-2">
            개인정보 처리방침
          </Link>
          에서 확인하실 수 있습니다.
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[15px] font-medium text-danger">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-primary px-8 text-[16px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "접수 중..." : "문의 보내기"}
      </button>
    </form>
  );
}


import Image from "next/image";

/**
 * STORY 본문 렌더러.
 * body 배열의 각 항목을 한 블록으로 보고, 아래 표기만 따로 그립니다. 그 밖의 항목은 기존과 같은 문단입니다.
 * - "## 소제목"            → 소제목 (h2)
 * - "### 작은 소제목"       → 작은 소제목 (h3)
 * - "![설명](/uploads/a.jpg)" → 이미지 (설명은 대체 텍스트와 캡션)
 * - 모든 줄이 "- "로 시작   → 목록
 * 기존 글(문단만 있는 글)은 그대로 보입니다.
 */
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

export default function StoryBody({ body }: { body: string[] }) {
  return (
    <>
      {body.map((block, i) => {
        const text = block.trim();

        if (text.startsWith("### ")) {
          return (
            <h3 key={i} className="t-h3 pt-4 text-ink">
              {text.slice(4)}
            </h3>
          );
        }
        if (text.startsWith("## ")) {
          return (
            <h2 key={i} className="t-h3 border-t border-line pt-10 text-[22px] text-ink md:text-[24px]">
              {text.slice(3)}
            </h2>
          );
        }

        const img = text.match(IMAGE);
        if (img) {
          const [, alt, src] = img;
          return (
            <figure key={i} className="py-2">
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                sizes="(min-width:820px) 680px, 100vw"
                className="h-auto w-full rounded-[16px]"
              />
              {alt && <figcaption className="t-meta mt-3 text-muted">{alt}</figcaption>}
            </figure>
          );
        }

        const lines = text.split("\n");
        if (lines.length > 0 && lines.every((l) => l.trimStart().startsWith("- "))) {
          return (
            <ul key={i} className="t-body-lg list-disc space-y-2 pl-6 text-ink-2">
              {lines.map((l, j) => (
                <li key={j}>{l.trimStart().slice(2)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="t-body-lg whitespace-pre-line text-ink-2">
            {block}
          </p>
        );
      })}
    </>
  );
}

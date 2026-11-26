import Image from "next/image";
import Link from "next/link";
import { parseBody, parseInline } from "@/lib/story-body";

/** STORY body renderer. The rules live in `@/lib/story-body` so the backoffice preview matches. */

function InlineText({ text }: { text: string }) {
  return parseInline(text).map((part, i) => {
    if (part.type === "bold") return <strong key={i} className="font-semibold text-ink">{part.text}</strong>;
    if (part.type === "link") {
      const className = "underline underline-offset-4 hover:text-primary";
      return part.href.startsWith("/") ? (
        <Link key={i} href={part.href} className={className}>
          {part.text}
        </Link>
      ) : (
        <a key={i} href={part.href} className={className} {...(part.href.startsWith("#") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
          {part.text}
        </a>
      );
    }
    return part.text;
  });
}

export default function StoryBody({ body }: { body: string[] }) {
  return (
    <>
      {parseBody(body).map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="t-h3 border-t border-line pt-10 text-[22px] text-ink md:text-[24px]">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="t-h3 pt-4 text-ink">
                {block.text}
              </h3>
            );
          case "image":
            return (
              <figure key={i} className="py-2">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={1200}
                  height={800}
                  sizes="(min-width:820px) 680px, 100vw"
                  className="h-auto w-full rounded-[16px]"
                />
                {block.alt && <figcaption className="t-meta mt-3 text-muted">{block.alt}</figcaption>}
              </figure>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List key={i} className={`t-body-lg space-y-2 pl-6 text-ink-2 ${List === "ul" ? "list-disc" : "list-decimal"}`}>
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineText text={item} />
                  </li>
                ))}
              </List>
            );
          }
          default:
            return (
              <p key={i} className="t-body-lg whitespace-pre-line text-ink-2">
                <InlineText text={block.text} />
              </p>
            );
        }
      })}
    </>
  );
}

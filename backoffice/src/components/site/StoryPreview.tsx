"use client";

import { parseBody, parseInline } from "@/generated/story-body";
import SiteImage from "./SiteImage";

// Same rules as the homepage StoryBody (shared story-body.ts), with matching sizes and spacing.
function InlineText({ text }: { text: string }) {
  return parseInline(text).map((part, i) => {
    if (part.type === "bold") return <strong key={i} className="font-semibold text-ink">{part.text}</strong>;
    if (part.type === "link") {
      return (
        <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          {part.text}
        </a>
      );
    }
    return part.text;
  });
}

export default function StoryPreview({ body }: { body: string[] }) {
  return (
    <div className="space-y-6 text-[17px] leading-[1.85] [overflow-wrap:anywhere] text-ink/80">
      {parseBody(body).map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="border-t border-line pt-10 text-[22px] leading-[1.4] font-bold text-ink">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-4 text-[22px] leading-[1.4] font-bold text-ink">
                {block.text}
              </h3>
            );
          case "image":
            return (
              <figure key={i} className="py-2">
                <SiteImage src={block.src} alt={block.alt} className="h-auto w-full rounded-2xl" />
                {block.alt && <figcaption className="mt-3 text-sm text-muted">{block.alt}</figcaption>}
              </figure>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List key={i} className={`space-y-2 pl-6 ${List === "ul" ? "list-disc" : "list-decimal"}`}>
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
              <p key={i} className="whitespace-pre-line">
                <InlineText text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}

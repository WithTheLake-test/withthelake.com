/**
 * STORY body rules, shared by the homepage and the backoffice preview.
 * Each body item is one block, split further as follows:
 * - "## title" / "### title" lines → headings (anywhere in the block)
 * - "![alt](/uploads/a.jpg)"        → image (when it is the whole block)
 * - every line starts with "- "     → bulleted list
 * - every line starts with "1. "    → numbered list
 * - anything else                    → paragraph (line breaks kept)
 * Inside text: "**bold**" and "[label](url)". Only http(s), "/" and "#" links are allowed.
 */

export type Inline = { type: "text"; text: string } | { type: "bold"; text: string } | { type: "link"; text: string; href: string };

export type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "p"; text: string };

const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const BULLET = /^\s*- /;
const NUMBERED = /^\s*\d+\.\s+/;
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export const isSafeHref = (href: string) => /^(https?:\/\/|\/|#)/i.test(href);

function textBlock(lines: string[]): Block | null {
  const text = lines.join("\n").replace(/^\n+|\n+$/g, "");
  if (!text.trim()) return null;
  const rows = text.split("\n");
  if (rows.every((row) => BULLET.test(row))) return { type: "ul", items: rows.map((row) => row.replace(BULLET, "")) };
  if (rows.every((row) => NUMBERED.test(row))) return { type: "ol", items: rows.map((row) => row.replace(NUMBERED, "")) };
  return { type: "p", text };
}

function parseBlock(block: string): Block[] {
  const image = block.trim().match(IMAGE);
  if (image) return [{ type: "image", alt: image[1], src: image[2] }];

  const blocks: Block[] = [];
  let lines: string[] = [];
  const flush = () => {
    const text = textBlock(lines);
    if (text) blocks.push(text);
    lines = [];
  };

  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: trimmed.slice(3) });
    } else {
      lines.push(line);
    }
  }
  flush();
  return blocks;
}

export const parseBody = (body: string[]): Block[] => body.flatMap(parseBlock);

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ type: "text", text: text.slice(last, index) });
    const [, bold, label, href] = match;
    if (bold !== undefined) parts.push({ type: "bold", text: bold });
    else if (isSafeHref(href)) parts.push({ type: "link", text: label, href });
    else parts.push({ type: "text", text: label });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", text: text.slice(last) });
  return parts;
}

// The editor shows the body as one text; each block separated by a blank line is one body item.
export const bodyToText = (body: string[]) => body.join("\n\n");

export const textToBody = (text: string) =>
  text
    .split(/\n[ \t]*\n/)
    .map((block) => block.replace(/^\n+|\s+$/g, ""))
    .filter(Boolean);

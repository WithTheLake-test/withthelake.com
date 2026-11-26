// Copies the homepage files the backoffice reuses into src/generated/ (not committed).
// Runs before `npm run dev` and `npm run build`; Cloudflare builds from the backoffice folder, so paths go up one level.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const out = join(here, "..", "src", "generated");

const FILES = [
  ["src/lib/story-body.ts", "story-body.ts"],
  ["src/lib/cms/types.ts", "site-types.ts"],
  ["content/site-content.json", "site-content.json"],
];

mkdirSync(out, { recursive: true });
for (const [from, to] of FILES) copyFileSync(join(repo, from), join(out, to));
console.log(`sync-site: copied ${FILES.length} files into src/generated`);

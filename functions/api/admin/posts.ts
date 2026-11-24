import { STORY_DIR, parseStory, slugFromPath, sortStories } from "../../../src/lib/cms/story-file";
import { handle, readCategories } from "../../../src/lib/admin/server";

/** GET /api/admin/posts — 글 목록(본문 제외)과 카테고리 */
export const onRequestGet = handle(async (_ctx, gh) => {
  const [files, categories] = await Promise.all([gh.listDir(STORY_DIR), readCategories(gh)]);
  const posts = await Promise.all(
    files
      .filter((f) => f.name.endsWith(".md"))
      .map(async (f) => ({ ...parseStory(slugFromPath(f.path), (await gh.readText(f.path))?.text ?? ""), body: "" })),
  );
  return { posts: sortStories(posts), categories };
});

import type { Story } from "../../../src/generated/site-types";
import { SaveInvalid, deletePost, updatePost } from "../../../src/lib/site/merge";
import { validatePost } from "../../../src/lib/site/validate";
import { handle, readBody, saveSiteContent, type Upload } from "../../../src/server/respond";

// PUT /api/site/post — `base` is the post as it was when the edit screen opened; only that post is replaced.
export const onRequestPut = handle(async ({ request }, gh) => {
  const { base, post, uploads } = await readBody<{ base: Story; post: Story; uploads?: Upload[] }>(request);
  return saveSiteContent(
    gh,
    (site) => {
      const items = updatePost(site.story.items, base, post);
      const others = items.filter((item) => item.slug !== post.slug);
      const issues = Object.values(validatePost(post, others, site.story.categories));
      if (issues.length) throw new SaveInvalid(issues.join(" "));
      return { site: { ...site, story: { ...site.story, items } }, message: `STORY 글 수정: ${post.slug}` };
    },
    uploads,
  );
});

// DELETE /api/site/post — removes the post only if nobody changed it since the edit screen opened.
export const onRequestDelete = handle(async ({ request }, gh) => {
  const { base } = await readBody<{ base: Story }>(request);
  return saveSiteContent(gh, (site) => ({
    site: { ...site, story: { ...site.story, items: deletePost(site.story.items, base) } },
    message: `STORY 글 삭제: ${base.slug}`,
  }));
});

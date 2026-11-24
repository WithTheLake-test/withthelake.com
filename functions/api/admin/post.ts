import { parseStory, serializeStory, storyPath, validateStory } from "../../../src/lib/cms/story-file";
import type { Story } from "../../../src/lib/cms/types";
import { HttpError, type Expectation, type FileChange } from "../../../src/lib/admin/github";
import { handle, readBody, readCategories, uploadChanges, type Upload } from "../../../src/lib/admin/server";

/** GET /api/admin/post?slug= — 카테고리 목록과, slug 가 있으면 글 하나와 파일 sha */
export const onRequestGet = handle(async ({ request }, gh) => {
  const slug = new URL(request.url).searchParams.get("slug");
  const categories = await readCategories(gh);
  if (!slug) return { categories };
  const file = await gh.readText(storyPath(slug));
  if (!file) throw new HttpError(404, "글을 찾을 수 없습니다.");
  return { categories, post: parseStory(slug, file.text), sha: file.sha };
});

type SaveBody = { post: Story; originalSlug?: string; sha?: string; uploads?: Upload[] };

/** PUT /api/admin/post — 새 글 작성 또는 수정. 글 주소가 바뀌면 파일 이름도 바꿉니다. */
export const onRequestPut = handle(async ({ request }, gh) => {
  const { post, originalSlug, sha, uploads } = await readBody<SaveBody>(request);
  const error = validateStory(post, await readCategories(gh));
  if (error) throw new HttpError(400, error);

  const isNew = !originalSlug;
  const renamed = !isNew && originalSlug !== post.slug;
  const text = serializeStory(post);
  const changes: FileChange[] = [{ path: storyPath(post.slug), text }, ...uploadChanges(uploads, text)];
  const expect: Expectation[] = [];
  if (isNew || renamed) expect.push({ path: storyPath(post.slug), sha: null });
  if (!isNew) expect.push({ path: storyPath(originalSlug), sha: sha ?? null });
  if (renamed) changes.push({ path: storyPath(originalSlug), delete: true });

  const commit = await gh.commit(changes, `게시물 ${isNew ? "추가" : "수정"}: ${post.title}`, expect).catch((e) => {
    if (e instanceof HttpError && e.status === 409 && (isNew || renamed)) {
      throw new HttpError(409, "같은 글 주소가 이미 있거나 다른 사람이 먼저 수정했습니다. 새로고침한 뒤 다시 확인해 주세요.");
    }
    throw e;
  });
  const saved = await gh.readText(storyPath(post.slug), commit);
  return { commit, sha: saved?.sha };
});

/** DELETE /api/admin/post — 글 삭제 */
export const onRequestDelete = handle(async ({ request }, gh) => {
  const { slug, sha, title } = await readBody<{ slug: string; sha: string; title: string }>(request);
  const commit = await gh.commit([{ path: storyPath(slug), delete: true }], `게시물 삭제: ${title}`, [{ path: storyPath(slug), sha }]);
  return { commit };
});

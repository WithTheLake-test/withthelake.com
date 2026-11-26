import type { ImpactContent } from "../../../src/generated/site-types";
import { SaveInvalid, impactCommitMessage, updateImpact, type ImpactChange } from "../../../src/lib/site/merge";
import { validateImpact } from "../../../src/lib/site/validate";
import { HttpError } from "../../../src/server/github";
import { handle, readBody, saveSiteContent, type Upload } from "../../../src/server/respond";

// PUT /api/site/impact — writes only the changed impact paths into the latest file.
export const onRequestPut = handle(async ({ request }, gh) => {
  const { changes, uploads } = await readBody<{ changes: ImpactChange[]; uploads?: Upload[] }>(request);
  if (!changes?.length) throw new HttpError(400, "바뀐 내용이 없습니다.");
  return saveSiteContent(
    gh,
    (site) => {
      const impact = updateImpact(site.impact as ImpactContent, changes);
      const problems = validateImpact(impact);
      if (problems.length) throw new SaveInvalid(`필수 항목을 입력해 주세요: ${problems.join(" / ")}`);
      return { site: { ...site, impact }, message: impactCommitMessage(changes) };
    },
    uploads,
  );
});

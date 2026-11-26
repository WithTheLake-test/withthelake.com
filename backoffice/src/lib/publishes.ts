import type { PublishCategory, PublishItem } from "./data/types";

export const CATEGORY_SHORT: Record<PublishCategory, string> = {
  기사PR: "PR",
  홈페이지: "홈페이지",
  카톡정기메세지: "카톡",
  N블로그: "블로그",
  인스타그램: "인스타",
};

export const isPublished = (item: PublishItem) => item.status === "발행완료";
export const needsPhoto = (item: PublishItem) => item.status === "사진수급필요";

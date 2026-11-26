import type { Metadata } from "next";
import { Suspense } from "react";
import PostEditView from "./PostEditView";

export const metadata: Metadata = { title: "글 수정" };

export default function PostEditPage() {
  return (
    <Suspense>
      <PostEditView />
    </Suspense>
  );
}

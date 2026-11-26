import type { Metadata } from "next";
import PostsView from "./PostsView";

export const metadata: Metadata = { title: "게시물 (STORY)" };

export default function PostsPage() {
  return <PostsView />;
}

import type { Metadata } from "next";
import ProgressView from "./ProgressView";

export const metadata: Metadata = { title: "진행 현황" };

export default function ProgressPage() {
  return <ProgressView />;
}

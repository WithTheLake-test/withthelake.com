import type { Metadata } from "next";
import TeamView from "./TeamView";

export const metadata: Metadata = { title: "팀 현황" };

export default function TeamPage() {
  return <TeamView />;
}

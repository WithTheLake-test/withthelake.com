import type { Metadata } from "next";
import { Suspense } from "react";
import ImpactView from "./ImpactView";

export const metadata: Metadata = { title: "성과 (IMPACT)" };

export default function ImpactPage() {
  return (
    <Suspense>
      <ImpactView />
    </Suspense>
  );
}

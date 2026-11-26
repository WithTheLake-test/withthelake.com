import type { Metadata } from "next";
import { Suspense } from "react";
import CalendarView from "./CalendarView";

export const metadata: Metadata = { title: "캘린더" };

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarView />
    </Suspense>
  );
}

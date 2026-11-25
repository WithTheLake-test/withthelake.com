import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/Toast";
import { getMembers } from "@/lib/data";
import { StoreProvider, StoreReady } from "@/lib/store";
import { UserProvider } from "@/lib/user";

export const metadata: Metadata = {
  title: { default: "위드더레이크 업무 관리", template: "%s | 위드더레이크 업무 관리" },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const members = await getMembers();

  return (
    <html lang="ko" className="antialiased">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
      </head>
      <body>
        <UserProvider members={members}>
          <StoreProvider>
            <ToastProvider>
              <AppShell>
                <StoreReady>{children}</StoreReady>
              </AppShell>
            </ToastProvider>
          </StoreProvider>
        </UserProvider>
      </body>
    </html>
  );
}

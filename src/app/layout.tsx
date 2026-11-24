import type { Metadata } from "next";
import "./globals.css";
import { getContent } from "@/lib/cms/store";
import { SITE_URL } from "@/lib/asset";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${site.name} | ${site.nameEn}`,
      template: `%s | 위드더레이크`,
    },
    description: site.description,
    openGraph: {
      title: `${site.name} | ${site.nameEn}`,
      description: site.description,
      siteName: site.nameEn,
      locale: "ko_KR",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Self-hosted font stylesheet served from public/fonts */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/site.css" />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}


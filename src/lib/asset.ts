/** 사이트 공개 URL (sitemap · OG 절대경로) */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.withthelake.com";

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

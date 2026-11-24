import type { NextConfig } from "next";

/**
 * 정적 export 설정 (Cloudflare Pages 배포용).
 * `npm run build` 결과는 out/ 에 생성됩니다.
 * - trailingSlash 기본값(false): /about → about.html 로 생성되어 기존 URL(/about)을 그대로 유지합니다.
 * - 이미지 최적화 서버가 없으므로 원본 이미지를 그대로 제공합니다.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;

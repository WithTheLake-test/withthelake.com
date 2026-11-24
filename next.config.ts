import type { NextConfig } from "next";

/**
 * 정적 export 설정 (Cloudflare Pages 배포용).
 * `npm run build` 결과는 out/ 에 생성됩니다.
 * - trailingSlash 기본값(false): /about → about.html 로 생성되어 기존 URL(/about)을 그대로 유지합니다.
 * - 이미지 최적화 서버가 없으므로 원본 이미지를 그대로 제공합니다.
 * - 관리자 화면(src/app/admin/*.admin.tsx)은 ADMIN_ENABLED=true 로 빌드할 때만 포함됩니다.
 *   운영 빌드(npm run build)에는 관리자 페이지가 생성되지 않습니다.
 */
const adminEnabled = process.env.ADMIN_ENABLED === "true";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  pageExtensions: adminEnabled ? ["admin.tsx", "tsx", "ts"] : ["tsx", "ts"],
};

export default nextConfig;

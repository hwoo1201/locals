import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
  // Sentry 조직/프로젝트 설정 (환경변수로 관리 권장)
  // Sentry 대시보드 > Settings > General에서 확인
  org: process.env.SENTRY_ORG || "your-org",
  project: process.env.SENTRY_PROJECT || "your-project",

  // 소스맵 업로드 (Sentry에서 원본 코드로 에러 위치 확인 가능)
  // SENTRY_AUTH_TOKEN: Sentry > Settings > Auth Tokens에서 발급
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,           // CI 환경에서만 빌드 로그 출력
  widenClientFileUpload: true,        // 클라이언트 소스맵 범위 확대
  hideSourceMaps: true,               // 프로덕션 번들에서 소스맵 숨김
  disableLogger: true,                // Sentry SDK 내부 로그 비활성화
  automaticVercelMonitors: true,      // Vercel Cron Monitor 자동 설정
});

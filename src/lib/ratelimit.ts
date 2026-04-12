import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

// Upstash Redis 클라이언트
// 환경변수: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// https://upstash.com → Redis 데이터베이스 생성 → REST API 탭에서 확인
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 인증 API (signup): 분당 5회
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:auth",
});

// 매칭 요청 / 리뷰: 분당 10회
export const matchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:match",
});

// 일반 API: 분당 30회
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:general",
});

// IP 추출 헬퍼
function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

// Rate limit 체크 헬퍼
// 초과 시 429 Response 반환, 통과 시 null 반환
export async function checkRateLimit(
  req: NextRequest,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  const ip = getIp(req);
  const { success } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  return null;
}

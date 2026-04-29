import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 비로그인 상태에서도 접근 가능한 경로
const PUBLIC_PREFIXES = [
  "/auth/callback",
  "/auth/verify-email",
  "/auth/confirm",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// 로그인 상태면 / 으로 리다이렉트
const GUEST_ONLY = ["/auth/login", "/auth/signup"];

// 로그인 필수 경로 (startsWith 체크)
const PROTECTED_PREFIXES = [
  "/mypage",
  "/matches",
  "/explore",
  "/project",
  "/shop/register",
  "/student-profile/register",
  "/dashboard",
  "/profile/edit",
];

// owner 전용 (student가 접근하면 / 로 리다이렉트)
const OWNER_ONLY_PREFIXES = ["/explore/students", "/shop/register"];
// student 전용 (owner가 접근하면 / 로 리다이렉트)
const STUDENT_ONLY_PREFIXES = ["/explore/shops", "/student-profile/register"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function isGuestOnly(pathname: string) {
  return GUEST_ONLY.some((p) => pathname === p);
}

function isPublicAuth(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 명시적 공개 auth 경로 — 어떤 상태에서도 통과
  if (isPublicAuth(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() 호출로 세션 갱신 + 유저 확인
  const { data: { user } } = await supabase.auth.getUser();

  const base = request.nextUrl.clone();

  // 비로그인 전용 경로 — 로그인 상태면 홈으로
  if (isGuestOnly(pathname) && user) {
    base.pathname = "/";
    base.search = "";
    return NextResponse.redirect(base);
  }

  // 보호 경로 — 비로그인이면 /auth/login?next=... 으로
  if (isProtected(pathname) && !user) {
    base.pathname = "/auth/login";
    base.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(base);
  }

  // 유저 타입 제한 (user_metadata에서 읽어 DB 조회 없이 처리)
  if (user) {
    const userType = user.user_metadata?.user_type as string | undefined;

    const isOwnerOnly = OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    const isStudentOnly = STUDENT_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

    if (userType && isOwnerOnly && userType !== "owner") {
      base.pathname = "/";
      base.search = "?error=wrong_user_type";
      return NextResponse.redirect(base);
    }

    if (userType && isStudentOnly && userType !== "student") {
      base.pathname = "/";
      base.search = "?error=wrong_user_type";
      return NextResponse.redirect(base);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

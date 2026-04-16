import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, authLimiter } from "@/lib/ratelimit";
import * as Sentry from "@sentry/nextjs";
import type { UserType } from "@/types";

// [Supabase 설정 필요]
// 1. Authentication > Email Templates에서 한국어 인증 메일 템플릿 설정 권장:
//      Subject: "[솜씨] 이메일 인증을 완료해주세요"
//      Body: "아래 버튼을 클릭하여 이메일 인증을 완료해주세요. {{ .ConfirmationURL }}"
// 2. Authentication > URL Configuration > Redirect URLs에 추가:
//      https://{your-domain}/auth/confirm
//      http://localhost:3000/auth/confirm

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
  if (!/[0-9]/.test(password)) return "숫자를 1개 이상 포함해야 합니다.";
  if (!/[^a-zA-Z0-9]/.test(password)) return "특수문자를 1개 이상 포함해야 합니다.";
  return null;
}

export async function POST(req: NextRequest) {
  const rateLimitRes = await checkRateLimit(req, authLimiter);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { email, password, name, phone, region, userType } = await req.json();

    if (!email || !password || !name || !userType) {
      return NextResponse.json({ error: "필수 값이 누락됐습니다." }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authData, error: authError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, user_type: userType },
        emailRedirectTo: `${SITE_URL}/auth/confirm`,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json({ error: "회원가입에 실패했습니다." }, { status: 500 });
    }

    const admin = createAdminClient();
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: user.id,
      user_type: userType as UserType,
      name,
      phone: phone || null,
      region: region || null,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);
      Sentry.captureException(profileError, { extra: { context: "signup - profile insert" } });
      console.error("프로필 생성 실패:", profileError);
      return NextResponse.json({ error: "프로필 생성에 실패했습니다: " + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: "signup" } });
    console.error("signup 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

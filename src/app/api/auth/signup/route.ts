import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, authLimiter } from "@/lib/ratelimit";
import { sendVerificationEmail } from "@/lib/email";
import * as Sentry from "@sentry/nextjs";
import type { UserType } from "@/types";

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

    const admin = createAdminClient();

    // admin.generateLink: 유저 생성 + 인증 토큰 발급 (Supabase 자체 메일 발송 없음)
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: { name, user_type: userType },
      },
    });

    if (linkError) {
      if (
        linkError.message.includes("already registered") ||
        linkError.message.includes("already exists") ||
        linkError.message.includes("email_exists")
      ) {
        return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const user = linkData.user;
    const tokenHash = linkData.properties?.hashed_token;

    if (!user || !tokenHash) {
      return NextResponse.json({ error: "회원가입에 실패했습니다." }, { status: 500 });
    }

    // 프로필 생성 (upsert: handle_new_user 트리거가 먼저 실행된 경우 충돌 방지)
    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: user.id,
      user_type: userType as UserType,
      name,
      phone: phone || null,
      region: region || null,
    }, { onConflict: "user_id" });

    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);
      Sentry.captureException(profileError, { extra: { context: "signup - profile upsert" } });
      console.error("프로필 생성 실패:", profileError);
      return NextResponse.json({ error: "프로필 생성에 실패했습니다: " + profileError.message }, { status: 500 });
    }

    // somsi.kr 링크로 인증 메일 발송 (Resend 경유 → 스팸 방지)
    await sendVerificationEmail({ toEmail: email, tokenHash });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: "signup" } });
    console.error("signup 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

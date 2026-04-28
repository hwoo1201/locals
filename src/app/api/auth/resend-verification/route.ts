import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendVerificationEmail } from "@/lib/email";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });

    const admin = createAdminClient();

    // magiclink: password 불필요, 클릭 시 이메일 인증 + 로그인 동시 처리
    const { data: linkData, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (error) {
      return NextResponse.json({ error: "인증 메일 재발송에 실패했습니다." }, { status: 400 });
    }

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) {
      return NextResponse.json({ error: "토큰 생성에 실패했습니다." }, { status: 500 });
    }

    await sendVerificationEmail({ toEmail: email, tokenHash, type: "magiclink" });
    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: "resend-verification" } });
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

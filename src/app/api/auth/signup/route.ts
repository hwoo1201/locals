import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import type { UserType } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone, region, userType } = await req.json();

    if (!email || !password || !name || !userType) {
      return NextResponse.json({ error: "필수 값이 누락됐습니다." }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. 유저 생성 (admin으로 email_confirm 우회)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 인증 없이 바로 활성화
      user_metadata: { name, user_type: userType },
    });

    if (authError) {
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;

    // 2. 프로필 생성 (admin이므로 RLS 우회)
    const { error: profileError } = await admin.from("profiles").insert({
      user_id: user.id,
      user_type: userType as UserType,
      name,
      phone: phone || null,
      region: region || null,
    });

    if (profileError) {
      // 프로필 생성 실패 시 유저 삭제 (롤백)
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.json({ error: "프로필 생성에 실패했습니다: " + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("signup 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

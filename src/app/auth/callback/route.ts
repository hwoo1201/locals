import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "magiclink" | null;

  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error("verifyOtp error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
    }
  } else {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  // 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
  }

  const userType = user.user_metadata?.user_type as string | undefined;

  // 추가 프로필 등록 여부 확인 (shops / student_profiles)
  if (userType === "owner") {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!shop) {
      return NextResponse.redirect(`${origin}/shop/register`);
    }
  } else if (userType === "student") {
    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!studentProfile) {
      return NextResponse.redirect(`${origin}/student-profile/register`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}

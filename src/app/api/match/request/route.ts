import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendMatchRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { target_id, shop_id, message } = await req.json();

    if (!target_id || !shop_id) {
      return NextResponse.json({ error: "필수 값이 누락됐습니다." }, { status: 400 });
    }

    // 자기 자신에게 요청 방지
    if (target_id === user.id) {
      return NextResponse.json({ error: "자기 자신에게 요청할 수 없습니다." }, { status: 400 });
    }

    // 중복 pending 요청 확인
    const { data: existing } = await supabase
      .from("match_requests")
      .select("id, status")
      .eq("requester_id", user.id)
      .eq("target_id", target_id)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "이미 보낸 요청이 있습니다." }, { status: 409 });
    }

    // 매칭 요청 생성
    const { data: matchRequest, error: insertError } = await supabase
      .from("match_requests")
      .insert({
        requester_id: user.id,
        target_id,
        shop_id,
        message: message || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 이메일 발송 (실패해도 요청 자체는 성공)
    try {
      const adminClient = createAdminClient();
      const [
        ,
        { data: { user: targetAuth } },
      ] = await Promise.all([
        adminClient.auth.admin.getUserById(user.id),
        adminClient.auth.admin.getUserById(target_id),
      ]);

      const [{ data: requesterProfile }, { data: shop }] = await Promise.all([
        supabase.from("profiles").select("name").eq("user_id", user.id).single(),
        supabase.from("shops").select("name").eq("id", shop_id).single(),
      ]);

      if (targetAuth?.email && requesterProfile && shop) {
        await sendMatchRequestEmail({
          toEmail: targetAuth.email,
          toName: targetAuth.user_metadata?.name || "사용자",
          fromName: (requesterProfile as { name: string }).name,
          shopName: (shop as { name: string }).name,
          message,
        });
      }
    } catch (emailErr) {
      console.error("이메일 발송 실패:", emailErr);
    }

    return NextResponse.json({ success: true, match_id: matchRequest.id });
  } catch (err) {
    console.error("match/request 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

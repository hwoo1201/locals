import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendMatchAcceptedEmail, sendMatchRejectedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { match_id, action } = await req.json();

    if (!match_id || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    // 매칭 요청 조회 + 본인 확인
    const { data: matchRequest, error: fetchError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", match_id)
      .eq("target_id", user.id)       // 본인이 target이어야 함
      .eq("status", "pending")
      .single();

    if (fetchError || !matchRequest) {
      return NextResponse.json({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    // 상태 업데이트
    const { error: updateError } = await supabase
      .from("match_requests")
      .update({ status: newStatus })
      .eq("id", match_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    let projectId: string | null = null;

    // 수락 시 프로젝트 자동 생성
    if (action === "accept") {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 28); // 기본 4주
      const endDateStr = endDate.toISOString().split("T")[0];

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          shop_id: matchRequest.shop_id,
          student_id: matchRequest.requester_id,
          match_id: match_id,
          status: "active",
          start_date: today,
          end_date: endDateStr,
          duration_weeks: 4,
        })
        .select("id")
        .single();

      if (!projectError && project) {
        projectId = project.id;
      }
    }

    // 이메일 발송
    try {
      const adminClient = createAdminClient();
      const [
        { data: { user: requesterAuth } },
      ] = await Promise.all([
        adminClient.auth.admin.getUserById(matchRequest.requester_id),
      ]);

      const [{ data: shop }, { data: targetProfile }] = await Promise.all([
        supabase.from("shops").select("name").eq("id", matchRequest.shop_id).single(),
        supabase.from("profiles").select("name").eq("user_id", user.id).single(),
      ]);

      if (requesterAuth?.email && shop && targetProfile) {
        if (action === "accept" && projectId) {
          await sendMatchAcceptedEmail({
            toEmail: requesterAuth.email,
            toName: requesterAuth.user_metadata?.name || "사용자",
            fromName: (targetProfile as { name: string }).name,
            shopName: (shop as { name: string }).name,
            projectId,
          });
        } else if (action === "reject") {
          await sendMatchRejectedEmail({
            toEmail: requesterAuth.email,
            toName: requesterAuth.user_metadata?.name || "사용자",
            fromName: (targetProfile as { name: string }).name,
            shopName: (shop as { name: string }).name,
          });
        }
      }
    } catch (emailErr) {
      console.error("이메일 발송 실패:", emailErr);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      project_id: projectId,
    });
  } catch (err) {
    console.error("match/respond 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

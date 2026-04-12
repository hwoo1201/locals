import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendMatchAcceptedEmail, sendMatchRejectedEmail } from "@/lib/email";
import { checkRateLimit, matchLimiter } from "@/lib/ratelimit";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
  const rateLimitRes = await checkRateLimit(req, matchLimiter);
  if (rateLimitRes) return rateLimitRes;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { match_id, action, duration_weeks, agreed_pay } = await req.json();

    if (!match_id || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const { data: matchRequest, error: fetchError } = await supabase
      .from("match_requests")
      .select("*")
      .eq("id", match_id)
      .eq("target_id", user.id)
      .eq("status", "pending")
      .single();

    if (fetchError || !matchRequest) {
      return NextResponse.json({ error: "요청을 찾을 수 없습니다." }, { status: 404 });
    }

    const newStatus = action === "accept" ? "accepted" : "rejected";

    const { error: updateError } = await supabase
      .from("match_requests")
      .update({ status: newStatus })
      .eq("id", match_id);

    if (updateError) {
      Sentry.captureException(updateError, { extra: { context: "match/respond - update" } });
      console.error("매칭 상태 업데이트 실패:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    let projectId: string | null = null;

    if (action === "accept") {
      const weeks = [2, 4, 8].includes(Number(duration_weeks)) ? Number(duration_weeks) : 4;
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + weeks * 7);
      const endDateStr = endDate.toISOString().split("T")[0];

      const parsedPay = agreed_pay != null && agreed_pay !== "" ? Number(agreed_pay) : null;
      const commissionAmount = parsedPay != null ? Math.round(parsedPay * 0.2) : null;

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          shop_id: matchRequest.shop_id,
          student_id: matchRequest.requester_id,
          match_id: match_id,
          status: "active",
          start_date: today,
          end_date: endDateStr,
          duration_weeks: weeks,
          agreed_pay: parsedPay,
          commission_rate: 20,
          commission_amount: commissionAmount,
          commission_status: "pending",
        })
        .select("id")
        .single();

      if (projectError) {
        Sentry.captureException(projectError, { extra: { context: "match/respond - project insert" } });
        console.error("프로젝트 생성 실패:", projectError);
      } else if (project) {
        projectId = project.id;
      }
    }

    // 이메일 발송 (실패해도 수락/거절 자체는 성공)
    let emailWarning: string | undefined;
    try {
      const adminClient = createAdminClient();
      const [{ data: { user: requesterAuth } }] = await Promise.all([
        adminClient.auth.admin.getUserById(matchRequest.requester_id),
      ]);

      const [{ data: shop }, { data: targetProfile }] = await Promise.all([
        supabase.from("shops").select("name").eq("id", matchRequest.shop_id).single(),
        supabase.from("profiles").select("name, contact_method").eq("user_id", user.id).single(),
      ]);

      if (requesterAuth?.email && shop && targetProfile) {
        if (action === "accept" && projectId) {
          await sendMatchAcceptedEmail({
            toEmail: requesterAuth.email,
            toName: requesterAuth.user_metadata?.name || "사용자",
            fromName: (targetProfile as { name: string; contact_method?: string }).name,
            shopName: (shop as { name: string }).name,
            projectId,
            fromContactMethod: (targetProfile as { name: string; contact_method?: string }).contact_method,
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
      Sentry.captureException(emailErr, { extra: { context: "match/respond - email" } });
      console.error("이메일 발송 실패:", emailErr);
      emailWarning = "매칭은 완료되었으나 알림 이메일 발송에 실패했습니다.";
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      project_id: projectId,
      ...(emailWarning && { warning: emailWarning }),
    });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: "match/respond" } });
    console.error("match/respond 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

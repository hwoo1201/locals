import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, generalLimiter } from "@/lib/ratelimit";
import * as Sentry from "@sentry/nextjs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = await checkRateLimit(_req, generalLimiter);
  if (rateLimitRes) return rateLimitRes;

  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("*, shops(owner_id)")
      .eq("id", id)
      .single();

    if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });

    const isOwner = (project.shops as { owner_id: string }).owner_id === user.id;
    const isStudent = project.student_id === user.id;
    if (!isOwner && !isStudent) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    if (project.status === "completed") {
      return NextResponse.json({ error: "이미 완료된 프로젝트입니다." }, { status: 400 });
    }

    const { error } = await admin
      .from("projects")
      .update({ status: "completed", end_date: new Date().toISOString().split("T")[0] })
      .eq("id", id);

    if (error) {
      Sentry.captureException(error, { extra: { context: "project/complete - update" } });
      console.error("프로젝트 완료 처리 실패:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 대학생 통계 업데이트: completed_projects_count + avg_pay 재계산
    try {
      const studentId = project.student_id;

      const { data: completedProjects } = await admin
        .from("projects")
        .select("agreed_pay")
        .eq("student_id", studentId)
        .eq("status", "completed");

      const completedCount = completedProjects?.length ?? 0;
      const paidProjects = (completedProjects ?? []).filter(
        (p: { agreed_pay: number | null }) => p.agreed_pay != null
      );
      const newAvgPay =
        paidProjects.length > 0
          ? Math.round(
              paidProjects.reduce((s: number, p: { agreed_pay: number }) => s + p.agreed_pay, 0) /
                paidProjects.length
            )
          : null;

      await admin
        .from("student_profiles")
        .update({
          completed_projects_count: completedCount,
          avg_pay: newAvgPay,
        })
        .eq("user_id", studentId);
    } catch (statsErr) {
      // 통계 업데이트 실패해도 완료 처리 자체는 성공
      Sentry.captureException(statsErr, { extra: { context: "project/complete - stats update" } });
      console.error("대학생 통계 업데이트 실패:", statsErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err, { extra: { context: "project/complete" } });
    console.error("complete 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

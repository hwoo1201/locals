import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, matchLimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const rateLimitRes = await checkRateLimit(req, matchLimiter);
  if (rateLimitRes) return rateLimitRes;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { project_id, reviewee_id, rating, content } = await req.json();

    if (!project_id || !reviewee_id || !rating) {
      return NextResponse.json({ error: "필수 값이 누락됐습니다." }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "별점은 1~5 사이여야 합니다." }, { status: 400 });
    }
    if (user.id === reviewee_id) {
      return NextResponse.json({ error: "자기 자신을 리뷰할 수 없습니다." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("*, shops(owner_id)")
      .eq("id", project_id)
      .single();

    if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    if (project.status !== "completed") {
      return NextResponse.json({ error: "완료된 프로젝트에만 리뷰를 작성할 수 있습니다." }, { status: 400 });
    }

    const isOwner = (project.shops as { owner_id: string }).owner_id === user.id;
    const isStudent = project.student_id === user.id;
    if (!isOwner && !isStudent) {
      return NextResponse.json({ error: "프로젝트 참여자만 리뷰를 작성할 수 있습니다." }, { status: 403 });
    }

    const { error } = await admin.from("reviews").insert({
      project_id,
      reviewer_id: user.id,
      reviewee_id,
      rating,
      content: content || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "이미 리뷰를 작성했습니다." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("review 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

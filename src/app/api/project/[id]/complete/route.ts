import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, generalLimiter } from "@/lib/ratelimit";

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
      .update({ status: "completed" })
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("complete 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

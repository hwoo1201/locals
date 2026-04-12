import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, generalLimiter } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const rateLimitRes = await checkRateLimit(req, generalLimiter);
  if (rateLimitRes) return rateLimitRes;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { project_id, measured_at, followers, visitors, revenue, posts_count, likes, custom_fields } = await req.json();

    if (!project_id || !measured_at) {
      return NextResponse.json({ error: "필수 값이 누락됐습니다." }, { status: 400 });
    }

    const admin = createAdminClient();

    // 소상공인 권한 확인
    const { data: project } = await admin.from("projects").select("shop_id").eq("id", project_id).single();
    if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });

    const { data: shop } = await admin.from("shops").select("owner_id").eq("id", project.shop_id).single();
    if (!shop || shop.owner_id !== user.id) {
      return NextResponse.json({ error: "소상공인만 데이터를 입력할 수 있습니다." }, { status: 403 });
    }

    const { error } = await admin.from("metrics").upsert(
      {
        project_id,
        measured_at,
        followers: followers != null && followers !== "" ? Number(followers) : null,
        visitors: visitors != null && visitors !== "" ? Number(visitors) : null,
        revenue: revenue != null && revenue !== "" ? Number(revenue) : null,
        posts_count: posts_count != null && posts_count !== "" ? Number(posts_count) : null,
        likes: likes != null && likes !== "" ? Number(likes) : null,
        custom_fields: custom_fields ?? [],
      },
      { onConflict: "project_id,measured_at" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("metrics 오류:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

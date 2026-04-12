import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Project, Shop, Profile, Metric, Review } from "@/types";
import ProjectAnalytics from "@/components/project/ProjectAnalytics";
import CompleteProjectButton from "@/components/project/CompleteProjectButton";
import ReviewSection from "@/components/project/ReviewSection";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">로그인이 필요합니다.</p>
        <Link href="/auth/login" className="btn-primary mt-4 inline-block">
          로그인
        </Link>
      </div>
    );
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();

  if (!project) notFound();

  const [
    { data: shop },
    { data: studentProfile },
    { data: beforeMetric },
    { data: afterMetric },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("shops").select("*").eq("id", project.shop_id).single<Shop>(),
    supabase.from("profiles").select("*").eq("user_id", project.student_id).single<Profile>(),
    supabase.from("metrics").select("*").eq("project_id", id).eq("measured_at", "before").maybeSingle<Metric>(),
    supabase.from("metrics").select("*").eq("project_id", id).eq("measured_at", "after").maybeSingle<Metric>(),
    supabase.from("reviews").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);

  const isOwner = shop?.owner_id === user.id;
  const isStudent = project.student_id === user.id;

  if (!isOwner && !isStudent) notFound();

  const ownerProfile = shop
    ? (await supabase.from("profiles").select("*").eq("user_id", shop.owner_id).single<Profile>()).data
    : null;

  // 현재 유저가 이미 리뷰했는지
  const myReview = (reviews as Review[] | null)?.find((r) => r.reviewer_id === user.id);
  const hasReviewed = !!myReview;

  // 리뷰어 이름 조회
  const reviewList = (reviews as Review[] | null) ?? [];
  const reviewerIds = Array.from(new Set(reviewList.map((r) => r.reviewer_id)));
  const reviewerProfiles =
    reviewerIds.length > 0
      ? (await supabase.from("profiles").select("user_id, name").in("user_id", reviewerIds)).data ?? []
      : [];
  const reviewerNames: Record<string, string> = Object.fromEntries(
    reviewerProfiles.map((p: Pick<Profile, "user_id" | "name">) => [p.user_id, p.name])
  );

  const daysLeft = project.end_date
    ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000))
    : null;

  const progressPercent =
    project.start_date && project.end_date
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((Date.now() - new Date(project.start_date).getTime()) /
                (new Date(project.end_date).getTime() - new Date(project.start_date).getTime())) *
                100
            )
          )
        )
      : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              project.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {project.status === "active" ? "진행 중" : "완료"}
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">
          {shop?.name || "프로젝트"}
        </h1>
        <p className="text-gray-500 mt-1">마케팅 협업 프로젝트</p>
      </div>

      {/* 효과 분석 (숨김 처리 - 추후 활성화) */}
      <div className="hidden">
        <ProjectAnalytics
          before={beforeMetric}
          after={afterMetric}
          projectId={id}
          isOwner={isOwner}
        />
      </div>

      {/* 프로젝트 정보 */}
      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">프로젝트 정보</h2>
        <div className="space-y-3 text-sm">
          {/* 기간 한 줄 요약 */}
          {project.start_date && (
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-500 mb-0.5">프로젝트 기간</p>
              <p className="font-semibold text-blue-900">
                {new Date(project.start_date).toLocaleDateString("ko-KR")}
                {project.end_date && ` ~ ${new Date(project.end_date).toLocaleDateString("ko-KR")}`}
                {project.duration_weeks ? ` (${project.duration_weeks}주)` : ""}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-1">남은 일수</p>
              <p className="font-medium">
                {daysLeft === 0 ? "오늘 종료" : daysLeft !== null ? `${daysLeft}일` : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">기간 유형</p>
              <p className="font-medium">
                {project.duration_weeks === 2
                  ? "2주 · 단기 테스트"
                  : project.duration_weeks === 8
                  ? "8주 · 장기"
                  : project.duration_weeks
                  ? "4주 · 기본"
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {project.status === "active" && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>진행률</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 급여 정보 */}
        {project.agreed_pay != null && (
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-500 mb-0.5">합의 월 급여</p>
            <p className="font-bold text-blue-900 text-lg">{project.agreed_pay}만원</p>
          </div>
        )}

        {/* 수수료 정보 - 대학생에게만 표시 */}
        {isStudent && project.agreed_pay != null && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">수수료 안내</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">플랫폼 수수료 (첫 달 20%)</span>
              <span className="font-semibold text-orange-600">
                {project.commission_amount ?? Math.round(project.agreed_pay * 0.2)}만원
              </span>
            </div>
            <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">실수령액</span>
              <span className="font-bold text-green-700">
                {project.agreed_pay - (project.commission_amount ?? Math.round(project.agreed_pay * 0.2))}만원
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400">수수료는 첫 달에만 1회 부과됩니다</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                project.commission_status === "paid"
                  ? "bg-green-100 text-green-700"
                  : project.commission_status === "waived"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {project.commission_status === "paid" ? "납부완료" : project.commission_status === "waived" ? "면제" : "미납"}
              </span>
            </div>
          </div>
        )}

        {/* 소상공인 비용 없음 안내 */}
        {isOwner && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-green-600 text-base font-bold">✓</span>
            <p className="text-sm text-green-700 font-medium">소상공인 플랫폼 비용은 없습니다</p>
          </div>
        )}
      </div>

      {/* 참여자 */}
      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">참여자</h2>
        <div className="space-y-3">
          <Link
            href={`/profile/${shop?.owner_id}`}
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">사장님</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{ownerProfile?.name}</p>
              <p className="text-xs text-gray-500">소상공인 · {shop?.category}</p>
            </div>
            {isOwner && (
              <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                나
              </span>
            )}
          </Link>

          <Link
            href={`/profile/${project.student_id}`}
            className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-orange-700">대학생</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{studentProfile?.name}</p>
              <p className="text-xs text-gray-500">대학생 마케터</p>
            </div>
            {isStudent && (
              <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                나
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 매장 정보 */}
      {shop && (
        <div className="card space-y-3">
          <h2 className="font-bold text-gray-900">매장 정보</h2>
          <div>
            <p className="font-semibold text-gray-800">{shop.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{shop.address}</p>
          </div>
          {shop.marketing_needs && (
            <div>
              <p className="label">마케팅 요청사항</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">
                {shop.marketing_needs}
              </p>
            </div>
          )}
          {shop.goals && (
            <div>
              <p className="label">목표</p>
              <p className="text-sm text-gray-700">{shop.goals}</p>
            </div>
          )}
        </div>
      )}

      {/* 프로젝트 완료 버튼 */}
      {project.status === "active" && (isOwner || isStudent) && (
        <CompleteProjectButton projectId={id} />
      )}

      {/* 리뷰 섹션 */}
      {project.status === "completed" && shop && (
        <div className="card space-y-4">
          <ReviewSection
            projectId={id}
            reviews={reviewList}
            reviewerNames={reviewerNames}
            currentUserId={user.id}
            ownerUserId={shop.owner_id}
            studentUserId={project.student_id}
            isOwner={isOwner}
            isStudent={isStudent}
            hasReviewed={hasReviewed}
          />
        </div>
      )}

      {/* 네비게이션 */}
      <div className="flex gap-3">
        <Link href="/matches" className="btn-secondary flex-1 text-center">
          ← 매칭 목록
        </Link>
        <Link href={`/profile/${shop?.owner_id}`} className="btn-primary flex-1 text-center">
          매장 보기 →
        </Link>
      </div>
    </div>
  );
}

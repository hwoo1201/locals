import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Profile, Shop, StudentProfile, Project } from "@/types";
import ProjectList from "@/components/mypage/ProjectList";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 프로필과 프로젝트를 관리합니다.",
};

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single<Profile>();

  if (!profile) redirect("/auth/signup");

  let shop: Shop | null = null;
  let studentProfile: StudentProfile | null = null;

  if (profile.user_type === "owner") {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
      .single<Shop>();
    shop = data;
  } else {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single<StudentProfile>();
    studentProfile = data;
  }

  // 내 프로젝트 (소상공인: shop_id 기준, 대학생: student_id 기준)
  let projects: Project[] = [];
  if (profile.user_type === "owner" && shop) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });
    projects = (data as Project[]) ?? [];
  } else if (profile.user_type === "student") {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    projects = (data as Project[]) ?? [];
  }

  // 프로젝트별 상점 이름 조회
  const shopIds = Array.from(new Set(projects.map((p) => p.shop_id)));
  const shopNames: Record<string, string> = {};
  if (shopIds.length > 0) {
    const { data: shops } = await supabase
      .from("shops")
      .select("id, name")
      .in("id", shopIds);
    (shops ?? []).forEach((s: { id: string; name: string }) => {
      shopNames[s.id] = s.name;
    });
  }

  const isOwner = profile.user_type === "owner";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
        <p className="text-gray-500 mt-1">{profile.name}님의 계정</p>
      </div>

      {/* 프로필 카드 */}
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isOwner ? "bg-blue-100" : "bg-orange-100"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                isOwner ? "text-blue-600" : "text-orange-600"
              }`}
            >
              {isOwner ? "사장님" : "대학생"}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.region || "지역 미설정"}</p>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <Link
            href={`/profile/${user.id}`}
            className="text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl transition-colors"
          >
            공개 프로필 보기
          </Link>
          {isOwner ? (
            <Link
              href="/shop/register"
              className="text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl transition-colors"
            >
              매장 정보 수정
            </Link>
          ) : (
            <Link
              href="/student-profile/register"
              className="text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl transition-colors"
            >
              프로필 수정
            </Link>
          )}
        </div>
      </div>

      {/* 소상공인 매장 요약 */}
      {isOwner && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">내 매장</h2>
            <Link href="/shop/register" className="text-sm text-blue-600 hover:underline">
              수정
            </Link>
          </div>
          {shop ? (
            <div>
              <p className="font-semibold text-gray-800">{shop.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{shop.category} · {shop.address}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">아직 등록된 매장이 없습니다</p>
              <Link href="/shop/register" className="btn-primary text-sm">
                매장 등록하기
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 대학생 프로필 요약 */}
      {!isOwner && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">마케터 프로필</h2>
            <Link href="/student-profile/register" className="text-sm text-blue-600 hover:underline">
              수정
            </Link>
          </div>
          {studentProfile ? (
            <div className="space-y-2">
              {studentProfile.interests && studentProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {studentProfile.interests.map((i) => (
                    <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              )}
              {studentProfile.experience && (
                <p className="text-sm text-gray-600 line-clamp-2">{studentProfile.experience}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">아직 마케터 프로필이 없습니다</p>
              <Link href="/student-profile/register" className="btn-primary text-sm">
                프로필 등록하기
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 프로젝트 목록 */}
      <div className="space-y-2">
        <h2 className="font-bold text-gray-900">내 프로젝트</h2>
        <ProjectList projects={projects} shopNames={shopNames} />
      </div>

      {/* 수수료 내역 (대학생 전용) */}
      {!isOwner && (() => {
        const commissionProjects = projects.filter((p) => p.agreed_pay != null);
        return (
          <div className="card space-y-4">
            <div>
              <h2 className="font-bold text-gray-900">수수료 내역</h2>
              <p className="text-xs text-gray-400 mt-0.5">매칭 성사된 프로젝트의 수수료 현황입니다</p>
            </div>

            <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-700">
              수수료 납부는 계좌이체로 진행됩니다. 매칭 성사 후 안내 이메일을 확인해주세요.
            </div>

            {commissionProjects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">아직 급여가 확정된 프로젝트가 없습니다</p>
            ) : (
              <div className="space-y-2">
                {commissionProjects.map((p) => {
                  const commission = p.commission_amount ?? Math.round((p.agreed_pay ?? 0) * 0.2);
                  return (
                    <div key={p.id} className="flex items-center justify-between py-3 border-t border-gray-100 first:border-0 first:pt-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {shopNames[p.shop_id] || "매장"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          합의 급여 {p.agreed_pay}만원 · 수수료 {commission}만원
                        </p>
                      </div>
                      <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        p.commission_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : p.commission_status === "waived"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.commission_status === "paid" ? "납부완료" : p.commission_status === "waived" ? "면제" : "미납"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 탐색 바로가기 */}
      <div className="card space-y-3">
        <h2 className="font-bold text-gray-900">바로가기</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={isOwner ? "/explore/students" : "/explore/shops"}
            className="text-center text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 py-3 rounded-xl transition-colors"
          >
            {isOwner ? "대학생 탐색" : "매장 탐색"}
          </Link>
          <Link
            href="/matches"
            className="text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 py-3 rounded-xl transition-colors"
          >
            매칭 관리
          </Link>
        </div>
      </div>
    </div>
  );
}

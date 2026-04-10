import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import type { Profile, Shop, StudentProfile, Review } from "@/types";
import Link from "next/link";
import MatchRequestButton from "@/components/match/MatchRequestButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: profile }, { data: { user } }, { data: reviewsRaw }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", id).single<Profile>(),
    supabase.auth.getUser(),
    supabase.from("reviews").select("*").eq("reviewee_id", id).order("created_at", { ascending: false }),
  ]);

  const reviews = (reviewsRaw as Review[] | null) ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  // 리뷰어 이름 조회
  const reviewerIds = Array.from(new Set(reviews.map((r) => r.reviewer_id)));
  const reviewerProfiles =
    reviewerIds.length > 0
      ? (await supabase.from("profiles").select("user_id, name").in("user_id", reviewerIds)).data ?? []
      : [];
  const reviewerNames: Record<string, string> = Object.fromEntries(
    reviewerProfiles.map((p: Pick<Profile, "user_id" | "name">) => [p.user_id, p.name])
  );

  if (!profile) {
    notFound();
  }

  let shop: Shop | null = null;
  let studentProfile: StudentProfile | null = null;

  if (profile.user_type === "owner") {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", id)
      .single<Shop>();
    shop = data;
  } else {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id)
      .single<StudentProfile>();
    studentProfile = data;
  }

  // 현재 로그인 사용자 정보
  let currentProfile: Profile | null = null;
  let currentShop: Shop | null = null;
  let existingRequest: { status: "pending" | "accepted" | "rejected" } | null = null;

  if (user && user.id !== id) {
    const { data: cp } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single<Profile>();
    currentProfile = cp;

    if (cp?.user_type === "owner") {
      const { data: cs } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single<{ id: string }>();
      currentShop = cs as Shop | null;
    }

    // 기존 요청 확인
    const { data: req } = await supabase
      .from("match_requests")
      .select("status")
      .eq("requester_id", user.id)
      .eq("target_id", id)
      .in("status", ["pending", "accepted"])
      .maybeSingle<{ status: "pending" | "accepted" | "rejected" }>();
    existingRequest = req;
  }

  const showMatchButton = user && user.id !== id && currentProfile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {profile.user_type === "owner" ? (
        <OwnerProfile
          profile={profile}
          shop={shop}
          reviews={reviews}
          avgRating={avgRating}
          reviewerNames={reviewerNames}
          matchButton={showMatchButton ? (
            <MatchRequestButton
              currentUserId={user!.id}
              currentUserType={currentProfile!.user_type}
              currentUserShopId={currentShop?.id}
              targetUserId={id}
              targetName={profile.name}
              targetShopId={shop?.id}
              targetShopName={shop?.name}
              existingStatus={existingRequest?.status ?? null}
            />
          ) : null}
        />
      ) : (
        <StudentProfileView
          profile={profile}
          studentProfile={studentProfile}
          reviews={reviews}
          avgRating={avgRating}
          reviewerNames={reviewerNames}
          matchButton={showMatchButton ? (
            <MatchRequestButton
              currentUserId={user!.id}
              currentUserType={currentProfile!.user_type}
              currentUserShopId={currentShop?.id}
              targetUserId={id}
              targetName={profile.name}
              targetShopId={undefined}
              targetShopName={undefined}
              existingStatus={existingRequest?.status ?? null}
            />
          ) : null}
        />
      )}
    </div>
  );
}

function ReviewList({ reviews, avgRating, reviewerNames }: { reviews: Review[]; avgRating: number | null; reviewerNames: Record<string, string> }) {
  if (reviews.length === 0) return null;
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg">리뷰</h2>
        {avgRating !== null && (
          <span className="text-sm font-bold text-yellow-500">
            {avgRating.toFixed(1)}점 <span className="text-gray-400 font-normal text-xs">/ 5 ({reviews.length}개)</span>
          </span>
        )}
      </div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-800">
                {reviewerNames[r.reviewer_id] || "익명"}
              </span>
              <span className="text-sm font-bold text-yellow-500">{r.rating}점</span>
            </div>
            {r.content && (
              <p className="text-sm text-gray-600 leading-relaxed">{r.content}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(r.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnerProfile({ profile, shop, reviews, avgRating, reviewerNames, matchButton }: { profile: Profile; shop: Shop | null; reviews: Review[]; avgRating: number | null; reviewerNames: Record<string, string>; matchButton?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">사장님</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{profile.name}</h1>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              소상공인
            </span>
            {profile.region && (
              <p className="text-sm text-gray-500 mt-1">{profile.region}</p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="text-gray-600 mt-4 text-sm leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* 매칭 버튼 */}
      {matchButton && <div>{matchButton}</div>}

      {/* 매장 정보 */}
      {shop ? (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">매장 정보</h2>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {shop.category}
            </span>
            <h3 className="text-lg font-bold">{shop.name}</h3>
          </div>

          <p className="text-sm text-gray-600">{shop.address}</p>

          {/* SNS 계정 */}
          {Object.entries(shop.sns_accounts || {}).some(([, v]) => v) && (
            <div>
              <p className="label">SNS 채널</p>
              <div className="flex flex-wrap gap-2">
                {shop.sns_accounts?.instagram && (
                  <a href={`https://instagram.com/${shop.sns_accounts.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full hover:bg-pink-100">
                    인스타그램
                  </a>
                )}
                {shop.sns_accounts?.naver_blog && (
                  <a href={shop.sns_accounts.naver_blog} target="_blank" rel="noopener noreferrer"
                    className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100">
                    네이버 블로그
                  </a>
                )}
                {shop.sns_accounts?.youtube && (
                  <a href={shop.sns_accounts.youtube} target="_blank" rel="noopener noreferrer"
                    className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100">
                    유튜브
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 매장 사진 */}
          {shop.photos?.length > 0 && (
            <div>
              <p className="label">매장 사진</p>
              <div className="grid grid-cols-3 gap-2">
                {shop.photos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt={`매장 사진 ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {/* 마케팅 니즈 */}
          {shop.marketing_needs && (
            <div>
              <p className="label">마케팅 요청사항</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
                {shop.marketing_needs}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {shop.budget_range && (
              <span>
                월 예산: <strong>{shop.budget_range}</strong>
              </span>
            )}
          </div>

          {shop.goals && (
            <div>
              <p className="label">마케팅 목표</p>
              <p className="text-sm text-gray-700 leading-relaxed">{shop.goals}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center text-gray-400 py-8">
          아직 등록된 매장 정보가 없습니다.
        </div>
      )}

      <ReviewList reviews={reviews} avgRating={avgRating} reviewerNames={reviewerNames} />
    </div>
  );
}

function StudentProfileView({
  profile,
  studentProfile,
  reviews,
  avgRating,
  reviewerNames,
  matchButton,
}: {
  profile: Profile;
  studentProfile: StudentProfile | null;
  reviews: Review[];
  avgRating: number | null;
  reviewerNames: Record<string, string>;
  matchButton?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-orange-600">대학생</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{profile.name}</h1>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              대학생 마케터
            </span>
            {profile.region && (
              <p className="text-sm text-gray-500 mt-1">{profile.region}</p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="text-gray-600 mt-4 text-sm leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* 매칭 버튼 */}
      {matchButton && <div>{matchButton}</div>}

      {/* 프로필 상세 */}
      {studentProfile ? (
        <div className="card space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">마케터 프로필</h2>

          {/* 관심 분야 */}
          <div>
            <p className="label">관심 분야</p>
            <div className="flex flex-wrap gap-2">
              {studentProfile.interests?.map((interest) => (
                <span key={interest}
                  className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* SNS 채널 */}
          {Object.entries(studentProfile.available_channels || {}).some(([, v]) => v) && (
            <div>
              <p className="label">가능한 SNS 채널</p>
              <div className="flex flex-wrap gap-2">
                {studentProfile.available_channels?.instagram && (
                  <span className="text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full">인스타그램</span>
                )}
                {studentProfile.available_channels?.youtube && (
                  <span className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full">유튜브</span>
                )}
                {studentProfile.available_channels?.tiktok && (
                  <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">틱톡</span>
                )}
                {studentProfile.available_channels?.naver_blog && (
                  <span className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full">네이버 블로그</span>
                )}
                {studentProfile.available_channels?.twitter && (
                  <span className="text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full">트위터</span>
                )}
              </div>
            </div>
          )}

          {/* 경험 소개 */}
          {studentProfile.experience && (
            <div>
              <p className="label">경험 소개</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
                {studentProfile.experience}
              </p>
            </div>
          )}

          {/* 포트폴리오 */}
          {studentProfile.portfolio_url && (
            <div>
              <p className="label">포트폴리오</p>
              <a
                href={studentProfile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                포트폴리오 보기 →
              </a>
            </div>
          )}

          {/* 선호 업종 */}
          {studentProfile.preferred_categories?.length > 0 && (
            <div>
              <p className="label">선호 업종</p>
              <div className="flex flex-wrap gap-2">
                {studentProfile.preferred_categories.map((cat) => (
                  <span key={cat} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 활동 가능 지역 */}
          {studentProfile.available_regions?.length > 0 && (
            <div>
              <p className="label">활동 가능 지역</p>
              <div className="flex flex-wrap gap-2">
                {studentProfile.available_regions.map((region) => (
                  <span key={region} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center text-gray-400 py-8">
          아직 등록된 프로필 정보가 없습니다.
        </div>
      )}

      <ReviewList reviews={reviews} avgRating={avgRating} reviewerNames={reviewerNames} />

      <div className="text-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Profile, StudentProfile, StudentInterest } from "@/types";

const INTERESTS: StudentInterest[] = [
  "SNS마케팅", "영상제작", "사진촬영", "디자인", "브랜딩", "기타",
];
const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "강원", "충남", "충북", "전북", "전남", "경북", "경남", "제주"];
const SNS_LABELS: Record<string, string> = {
  instagram: "인스타그램",
  youtube: "유튜브",
  tiktok: "틱톡",
  naver_blog: "네이버 블로그",
  twitter: "트위터",
};

interface StudentCard {
  profile: Profile;
  studentProfile: StudentProfile;
}

export default function ExploreStudentsPage() {
  const [students, setStudents] = useState<StudentCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterRegion, setFilterRegion] = useState("");
  const [filterInterests, setFilterInterests] = useState<StudentInterest[]>([]);
  const [filterChannel, setFilterChannel] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: sps }, { data: profiles }] = await Promise.all([
        supabase.from("student_profiles").select("*"),
        supabase.from("profiles").select("*").eq("user_type", "student"),
      ]);

      if (!sps || !profiles) { setLoading(false); return; }

      const profileMap = new Map(profiles.map((p: Profile) => [p.user_id, p]));
      const cards: StudentCard[] = sps
        .map((sp: StudentProfile) => {
          const profile = profileMap.get(sp.user_id);
          if (!profile) return null;
          return { profile, studentProfile: sp };
        })
        .filter(Boolean) as StudentCard[];

      setStudents(cards);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return students.filter(({ profile, studentProfile }) => {
      if (filterRegion && !profile.region?.includes(filterRegion)) return false;
      if (filterInterests.length > 0 && !filterInterests.some((i) => studentProfile.interests?.includes(i))) return false;
      if (filterChannel && !studentProfile.available_channels?.[filterChannel as keyof typeof studentProfile.available_channels]) return false;
      return true;
    });
  }, [students, filterRegion, filterInterests, filterChannel]);

  const toggleInterest = (interest: StudentInterest) => {
    setFilterInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const resetFilters = () => {
    setFilterRegion("");
    setFilterInterests([]);
    setFilterChannel("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">대학생 마케터 탐색</h1>
        <p className="text-gray-500 mt-1">함께 일할 대학생 마케터를 찾아보세요</p>
      </div>

      {/* 필터 */}
      <div className="card mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">필터</h2>
          <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline">
            초기화
          </button>
        </div>

        {/* 지역 필터 */}
        <div>
          <p className="label">지역</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRegion(filterRegion === r ? "" : r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterRegion === r
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* 관심 분야 필터 */}
        <div>
          <p className="label">관심 분야</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterInterests.includes(interest)
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* SNS 채널 필터 */}
        <div>
          <p className="label">가능한 SNS 채널</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SNS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterChannel(filterChannel === key ? "" : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  filterChannel === key
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 수 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? "로딩 중..." : `${filtered.length}명의 대학생 마케터`}
        </p>
      </div>

      {/* 카드 그리드 */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">조건에 맞는 대학생이 없습니다</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ profile, studentProfile }) => (
            <Link
              key={profile.user_id}
              href={`/profile/${profile.user_id}`}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden !p-0"
            >
              {/* 썸네일 */}
              {studentProfile.portfolio_images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={studentProfile.portfolio_images[0].url}
                  alt="작업물 썸네일"
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <span className="text-3xl font-black text-orange-200">M</span>
                </div>
              )}

              <div className="p-5">
              {/* 아바타 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-orange-600">대학생</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {profile.name}
                  </p>
                  {profile.region && (
                    <p className="text-xs text-gray-400 truncate">{profile.region}</p>
                  )}
                </div>
              </div>

              {/* 관심 분야 태그 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {studentProfile.interests?.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    {interest}
                  </span>
                ))}
                {(studentProfile.interests?.length || 0) > 3 && (
                  <span className="text-xs text-gray-400">+{studentProfile.interests.length - 3}</span>
                )}
              </div>

              {/* SNS 채널 */}
              <div className="flex flex-wrap gap-1">
                {studentProfile.available_channels?.instagram && (
                  <span className="text-xs bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">인스타그램</span>
                )}
                {studentProfile.available_channels?.youtube && (
                  <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">유튜브</span>
                )}
                {studentProfile.available_channels?.tiktok && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">틱톡</span>
                )}
                {studentProfile.available_channels?.naver_blog && (
                  <span className="text-xs bg-green-50 text-green-500 px-2 py-0.5 rounded-full">네이버 블로그</span>
                )}
              </div>

              {/* 경험 요약 */}
              {studentProfile.experience && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                  {studentProfile.experience}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-blue-600 font-medium group-hover:underline">
                  프로필 보기 →
                </span>
              </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

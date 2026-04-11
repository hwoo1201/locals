"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { StudentInterest, ShopCategory, AvailableChannels } from "@/types";

const INTERESTS: StudentInterest[] = [
  "SNS마케팅",
  "영상제작",
  "사진촬영",
  "디자인",
  "브랜딩",
  "기타",
];

const CATEGORIES: ShopCategory[] = ["카페", "음식점", "소매", "뷰티", "기타"];

const REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const SNS_CHANNELS: { key: keyof AvailableChannels; label: string }[] = [
  { key: "instagram", label: "인스타그램" },
  { key: "youtube", label: "유튜브" },
  { key: "tiktok", label: "틱톡" },
  { key: "naver_blog", label: "네이버 블로그" },
  { key: "twitter", label: "트위터/X" },
];

export default function StudentProfileRegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [interests, setInterests] = useState<StudentInterest[]>([]);
  const [channels, setChannels] = useState<AvailableChannels>({});
  const [experience, setExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<ShopCategory[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, contact_method")
        .eq("user_id", user.id)
        .single();

      if (profile?.user_type !== "student") {
        router.push("/");
        return;
      }

      setUserId(user.id);
      setContactMethod((profile as { user_type: string; contact_method?: string }).contact_method || "");

      const { data: sp } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (sp) {
        setExistingProfileId(sp.id);
        setInterests(sp.interests || []);
        setChannels(sp.available_channels || {});
        setExperience(sp.experience || "");
        setPortfolioUrl(sp.portfolio_url || "");
        setPreferredCategories(sp.preferred_categories || []);
        setAvailableRegions(sp.available_regions || []);
      }
    };
    load();
  }, [router]);

  const toggleInterest = (interest: StudentInterest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleCategory = (cat: ShopCategory) => {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRegion = (region: string) => {
    setAvailableRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleChannel = (key: keyof AvailableChannels) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (interests.length === 0) {
      setError("관심 분야를 최소 1개 선택해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      user_id: userId,
      interests,
      available_channels: channels,
      experience,
      portfolio_url: portfolioUrl || null,
      preferred_categories: preferredCategories,
      available_regions: availableRegions,
    };

    let dbError;
    if (existingProfileId) {
      const { error } = await supabase
        .from("student_profiles")
        .update(payload)
        .eq("id", existingProfileId);
      dbError = error;
    } else {
      const { error } = await supabase.from("student_profiles").insert(payload);
      dbError = error;
    }

    if (!dbError) {
      await supabase
        .from("profiles")
        .update({ contact_method: contactMethod || null })
        .eq("user_id", userId);
    }

    setLoading(false);
    if (dbError) {
      setError("저장에 실패했습니다: " + dbError.message);
    } else {
      setSuccess("프로필이 저장되었습니다!");
      setTimeout(() => router.push("/dashboard/student"), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {existingProfileId ? "프로필 수정" : "프로필 등록"}
        </h1>
        <p className="text-gray-500 mt-1">나의 역량을 소개하고 소상공인과 매칭되세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 관심 분야 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">관심 분야 *</h2>
          <p className="text-sm text-gray-500 -mt-2">복수 선택 가능</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  interests.includes(interest)
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* 가능 SNS 채널 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">가능한 SNS 채널</h2>
          <div className="flex flex-wrap gap-2">
            {SNS_CHANNELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleChannel(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  channels[key]
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 경험 설명 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">경험 소개</h2>
          <div>
            <label className="label">마케팅 경험 설명</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="마케팅 관련 경험, 수업, 동아리 활동 등을 자유롭게 소개해주세요."
              rows={5}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="label">포트폴리오 URL</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </div>
        </div>

        {/* 선호 업종 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">선호 업종</h2>
          <p className="text-sm text-gray-500 -mt-2">활동하고 싶은 업종을 선택하세요 (복수 선택 가능)</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  preferredCategories.includes(cat)
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 연락처 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">연락처</h2>
          <p className="text-sm text-gray-500 -mt-2">매칭 수락 시 상대방에게만 공개됩니다</p>
          <div>
            <label className="label">선호 연락 방식</label>
            <input
              type="text"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              placeholder="카카오톡 ID 또는 전화번호"
              className="input-field"
            />
          </div>
        </div>

        {/* 활동 가능 지역 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">활동 가능 지역</h2>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => toggleRegion(region)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                  availableRegions.includes(region)
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-center text-base"
        >
          {loading ? "저장 중..." : existingProfileId ? "프로필 수정 완료" : "프로필 등록 완료"}
        </button>
      </form>
    </div>
  );
}

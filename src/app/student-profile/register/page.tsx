"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { StudentInterest, ShopCategory, AvailableChannels, PortfolioImage, MarketerType, FollowerRange, ContentFormat } from "@/types";

const MARKETER_TYPES: { value: MarketerType; label: string; desc: string }[] = [
  { value: "student", label: "마케팅 전공/부전공 대학생", desc: "관련 전공 수업을 듣고 있는 대학생" },
  { value: "instagram_content_creator", label: "인스타 정보계정 운영자", desc: "팔로워를 보유한 정보성 인스타 계정 운영자" },
  { value: "freelancer_junior", label: "주니어 프리랜서", desc: "소규모 프리랜서 경험이 있는 마케터" },
  { value: "sidejob", label: "N잡러 / 사이드잡", desc: "본업 외 마케팅을 부업으로 하는 분" },
  { value: "other", label: "기타", desc: "위에 해당하지 않는 경우" },
];

const FOLLOWER_RANGES: { value: FollowerRange; label: string }[] = [
  { value: "under_1k", label: "1,000명 미만" },
  { value: "1k_to_5k", label: "1,000 ~ 5,000명" },
  { value: "5k_to_10k", label: "5,000 ~ 10,000명" },
  { value: "10k_to_50k", label: "10,000 ~ 50,000명" },
  { value: "50k_to_100k", label: "50,000 ~ 100,000명" },
  { value: "over_100k", label: "100,000명 이상" },
];

const CONTENT_FORMATS: { value: ContentFormat; label: string }[] = [
  { value: "card_news", label: "카드뉴스" },
  { value: "reels", label: "릴스/숏폼" },
  { value: "info_post", label: "정보성 피드" },
  { value: "curation", label: "큐레이션" },
  { value: "other", label: "기타" },
];

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [marketerType, setMarketerType] = useState<MarketerType>("student");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [pageTopic, setPageTopic] = useState("");
  const [followerRange, setFollowerRange] = useState<FollowerRange>("under_1k");
  const [contentFormat, setContentFormat] = useState<ContentFormat>("card_news");

  const [interests, setInterests] = useState<StudentInterest[]>([]);
  const [channels, setChannels] = useState<AvailableChannels>({});
  const [experience, setExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [desiredPay, setDesiredPay] = useState<string>("");
  const [preferredCategories, setPreferredCategories] = useState<ShopCategory[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);

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
        setMarketerType(sp.marketer_type || "student");
        setInstagramHandle(sp.instagram_handle || "");
        setPageTopic(sp.page_topic || "");
        setFollowerRange(sp.follower_range || "under_1k");
        setContentFormat(sp.content_format || "card_news");
        setInterests(sp.interests || []);
        setChannels(sp.available_channels || {});
        setExperience(sp.experience || "");
        setPortfolioUrl(sp.portfolio_url || "");
        setPreferredCategories(sp.preferred_categories || []);
        setAvailableRegions(sp.available_regions || []);
        setPortfolioImages(sp.portfolio_images || []);
        setDesiredPay(sp.desired_pay != null ? String(sp.desired_pay) : "");
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

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !userId) return;
    if (portfolioImages.length >= 3) {
      setError("작업물 이미지는 최대 3장까지 업로드할 수 있습니다.");
      return;
    }

    const remaining = 3 - portfolioImages.length;
    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }
    }

    setUploading(true);
    setError("");
    const uploaded: PortfolioImage[] = [];

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-images")
          .getPublicUrl(fileName);
        uploaded.push({ url: publicUrl, caption: "" });
      }
    }

    setPortfolioImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePortfolioImage = (idx: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, caption: string) => {
    setPortfolioImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, caption } : img))
    );
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
      marketer_type: marketerType,
      instagram_handle: marketerType === "instagram_content_creator" ? instagramHandle || null : null,
      page_topic: marketerType === "instagram_content_creator" ? pageTopic || null : null,
      follower_range: marketerType === "instagram_content_creator" ? followerRange : null,
      content_format: marketerType === "instagram_content_creator" ? contentFormat : null,
      interests,
      available_channels: channels,
      experience,
      portfolio_url: portfolioUrl || null,
      preferred_categories: preferredCategories,
      available_regions: availableRegions,
      portfolio_images: portfolioImages,
      desired_pay: desiredPay !== "" ? Number(desiredPay) : null,
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
        {/* 마케터 유형 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-[#1A1A14] text-lg">마케터 유형 *</h2>
          <p className="text-sm text-[#8A8A7E] -mt-2">본인에게 가장 잘 맞는 유형을 선택하세요</p>
          <div className="space-y-2">
            {MARKETER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMarketerType(type.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  marketerType === type.value
                    ? "border-[#4A7C59] bg-[#4A7C59]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className={`font-semibold text-sm ${marketerType === type.value ? "text-[#4A7C59]" : "text-[#1A1A14]"}`}>{type.label}</p>
                <p className="text-xs text-[#8A8A7E] mt-0.5">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 인스타 정보계정 상세 (조건부) */}
        {marketerType === "instagram_content_creator" && (
          <div className="card space-y-4 border-[#D6A77A]/40">
            <h2 className="font-bold text-[#1A1A14] text-lg">인스타그램 계정 정보</h2>
            <div>
              <label className="label">인스타그램 핸들 (@)</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@username"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">계정 주제/카테고리</label>
              <input
                type="text"
                value={pageTopic}
                onChange={(e) => setPageTopic(e.target.value)}
                placeholder="예: 뷰티, 맛집, 라이프스타일"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">팔로워 수</label>
              <select
                value={followerRange}
                onChange={(e) => setFollowerRange(e.target.value as FollowerRange)}
                className="input-field"
              >
                {FOLLOWER_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">주로 만드는 콘텐츠 형식</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setContentFormat(f.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      contentFormat === f.value
                        ? "border-[#4A7C59] bg-[#4A7C59] text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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

        {/* 희망 급여 */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">희망 급여</h2>
            <p className="text-sm text-gray-500 mt-0.5">소상공인이 참고합니다. 매칭 후 협의 가능합니다.</p>
          </div>
          <div>
            <label className="label">희망 월 급여</label>
            <div className="relative">
              <input
                type="number"
                value={desiredPay}
                onChange={(e) => setDesiredPay(e.target.value)}
                placeholder="예: 15"
                min={0}
                className="input-field pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">만원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">소상공인에게 보여지는 희망 급여입니다</p>
          </div>
        </div>

        {/* 작업물 이미지 */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">작업물 이미지</h2>
            <p className="text-sm text-gray-500 mt-0.5">최대 3장 · 5MB 이하 · JPG, PNG, WebP</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {portfolioImages.map((img, idx) => (
              <div key={idx} className="w-full">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`작업물 ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => updateCaption(idx, e.target.value)}
                  placeholder="한 줄 설명 (선택)"
                  className="input-field mt-2 text-sm"
                />
              </div>
            ))}

            {portfolioImages.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm gap-1"
              >
                {uploading ? (
                  "업로드 중..."
                ) : (
                  <>
                    <span className="text-2xl font-light">+</span>
                    <span>이미지 추가 ({portfolioImages.length}/3)</span>
                  </>
                )}
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handlePortfolioUpload}
          />
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

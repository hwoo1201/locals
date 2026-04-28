"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ShopCategory, BudgetRange, SnsAccounts } from "@/types";

const CATEGORIES: ShopCategory[] = ["카페", "음식점", "소매", "뷰티", "기타"];
const BUDGET_RANGES: { value: BudgetRange; label: string }[] = [
  { value: "free_or_negotiable", label: "무료/협의" },
  { value: "under_100k",        label: "10만원 이하" },
  { value: "100k_to_300k",      label: "10~30만원" },
  { value: "300k_to_500k",      label: "30~50만원" },
  { value: "500k_to_1m",        label: "50~100만원" },
  { value: "over_1m",           label: "100만원 이상" },
];

export default function ShopRegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [existingShopId, setExistingShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShopCategory>("카페");
  const [address, setAddress] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [sns, setSns] = useState<SnsAccounts>({});
  const [marketingNeeds, setMarketingNeeds] = useState("");
  const [budgetRange, setBudgetRange] = useState<BudgetRange>("100k_to_300k");
  const [goals, setGoals] = useState("");
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

      if (profile?.user_type !== "owner") {
        router.push("/");
        return;
      }

      setUserId(user.id);
      setContactMethod((profile as { user_type: string; contact_method?: string }).contact_method || "");

      const { data: shop } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (shop) {
        setExistingShopId(shop.id);
        setName(shop.name || "");
        setCategory(shop.category || "카페");
        setAddress(shop.address || "");
        setPhotoUrls(shop.photos || []);
        setSns(shop.sns_accounts || {});
        setMarketingNeeds(shop.marketing_needs || "");
        setBudgetRange((shop.budget_range as BudgetRange) || "100k_to_300k");
        setGoals(shop.goals || "");
      }
    };
    load();
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !userId) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("shop-photos")
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("shop-photos")
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
    }

    setPhotoUrls((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const removePhoto = (url: string) => {
    setPhotoUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setLoading(true);

    const payload = {
      owner_id: userId,
      name,
      category,
      address,
      photos: photoUrls,
      sns_accounts: sns,
      marketing_needs: marketingNeeds,
      budget_range: budgetRange,
      goals,
    };

    let dbError;
    if (existingShopId) {
      const { error } = await supabase
        .from("shops")
        .update(payload)
        .eq("id", existingShopId);
      dbError = error;
    } else {
      const { error } = await supabase.from("shops").insert(payload);
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
      setSuccess("매장 정보가 저장되었습니다!");
      setTimeout(() => router.push("/dashboard/owner"), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1A1A14]">
          {existingShopId ? "매장 정보 수정" : "매장 등록"}
        </h1>
        <p className="text-[#6A6A5E] mt-1">매장 정보를 입력해 마케터와 매칭되세요</p>
      </div>

      {!existingShopId && (
        <div className="bg-[#F0E2B0] border border-[#D6A77A]/50 rounded-2xl px-5 py-4 text-sm text-[#5A5A4E] leading-relaxed">
          <p className="font-semibold text-[#1A1A14] mb-1">MATCHR는 소규모 사업을 위한 플랫폼입니다</p>
          <p>월매출 200만원 이하의 소규모 사업자와 마케터를 연결합니다. 플랫폼 이용료는 없으며, 마케터에게 직접 급여를 협의해 지급합니다.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">기본 정보</h2>

          <div>
            <label className="label">매장명 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동 카페"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="label">업종 *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    category === cat
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">주소 *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="예: 서울특별시 강남구 테헤란로 123"
              required
              className="input-field"
            />
          </div>
        </div>

        {/* 사진 업로드 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">매장 사진</h2>

          <div className="flex flex-wrap gap-3">
            {photoUrls.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="매장 사진" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors text-xs"
            >
              {uploading ? "업로드 중..." : <><span className="text-2xl">+</span><span>사진 추가</span></>}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* SNS 계정 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">SNS 계정</h2>
          {[
            { key: "instagram", label: "인스타그램", placeholder: "@handle" },
            { key: "naver_blog", label: "네이버 블로그", placeholder: "blog.naver.com/..." },
            { key: "youtube", label: "유튜브", placeholder: "채널 URL" },
            { key: "tiktok", label: "틱톡", placeholder: "@handle" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type="text"
                value={sns[key as keyof SnsAccounts] || ""}
                onChange={(e) => setSns((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                className="input-field"
              />
            </div>
          ))}
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

        {/* 마케팅 정보 */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">마케팅 정보</h2>

          <div>
            <label className="label">마케팅 요청사항</label>
            <textarea
              value={marketingNeeds}
              onChange={(e) => setMarketingNeeds(e.target.value)}
              placeholder="원하는 마케팅 내용을 자유롭게 적어주세요. 예: 인스타그램 릴스 제작, 음식 사진 촬영 등"
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="label">마케터 월 급여 범위</label>
            <p className="text-xs text-gray-400 -mt-2 mb-1">마케터에게 지급할 월 급여 범위입니다. 매칭 후 협의로 확정됩니다.</p>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value as BudgetRange)}
              className="input-field"
            >
              {BUDGET_RANGES.map((range) => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">마케팅 목표</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="마케팅을 통해 이루고 싶은 목표를 적어주세요. 예: 인스타그램 팔로워 1000명 달성, 월 방문객 20% 증가"
              rows={3}
              className="input-field resize-none"
            />
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
          {loading ? "저장 중..." : existingShopId ? "수정 완료" : "매장 등록 완료"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Profile, Shop } from "@/types";

export default function OwnerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileData) {
        // 프로필 미생성 계정 → 재가입 유도
        router.push("/auth/signup");
        return;
      }
      if (profileData.user_type !== "owner") {
        // 잘못된 대시보드 접근 → 올바른 대시보드로
        router.push("/dashboard/student");
        return;
      }
      setProfile(profileData);

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      setShop(shopData);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          안녕하세요, {profile?.name}님
        </h1>
        <p className="text-gray-500 mt-1">소상공인 대시보드</p>
      </div>

      {/* 매장 등록 유도 */}
      {!shop ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-2">매장을 등록해보세요!</h2>
          <p className="text-blue-100 mb-4 text-sm">
            매장 정보를 등록하면 대학생 마케터와 매칭될 수 있어요.
          </p>
          <Link
            href="/shop/register"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            매장 등록하기 →
          </Link>
        </div>
      ) : (
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {shop.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{shop.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{shop.address}</p>
            </div>
            <Link
              href="/shop/register"
              className="text-sm text-blue-600 hover:underline"
            >
              수정
            </Link>
          </div>
          {shop.budget_range && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>월 예산: {shop.budget_range}</span>
            </div>
          )}
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/shop/register", label: "매장 관리", desc: "정보 수정" },
          { href: "/explore/students", label: "대학생 탐색", desc: "마케터 찾기" },
          { href: "/matches", label: "매칭 요청", desc: "요청 관리" },
          { href: "#", label: "효과 분석", desc: "준비 중" },
          { href: "#", label: "리뷰", desc: "준비 중" },
          { href: `/profile/${profile?.user_id}`, label: "내 프로필", desc: "공개 페이지" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="card hover:shadow-md transition-shadow text-center"
          >
            <div className="font-semibold text-sm text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>

    </div>
  );
}

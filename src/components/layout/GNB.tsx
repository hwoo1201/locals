"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export default function GNB() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setProfile(data);
      }
    };
    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
      } else {
        getProfile();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600">LOCALS</span>
            <span className="hidden sm:block text-xs text-gray-500 font-medium">소상공인 × 대학생</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-4">
            {profile ? (
              <>
                <Link
                  href={profile.user_type === "owner" ? "/dashboard/owner" : "/dashboard/student"}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  대시보드
                </Link>
                {/* 탐색 링크 */}
                {profile.user_type === "owner" && (
                  <Link href="/explore/students" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    대학생 탐색
                  </Link>
                )}
                {profile.user_type === "student" && (
                  <Link href="/explore/shops" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    매장 탐색
                  </Link>
                )}
                {/* 매칭 */}
                <Link href="/matches" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  매칭
                </Link>
                <Link href="/mypage" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  마이페이지
                </Link>
                <Link href={`/profile/${profile.user_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  {profile.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  무료 시작하기
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            <div className="w-5 h-0.5 bg-gray-700 mb-1" />
            <div className="w-5 h-0.5 bg-gray-700 mb-1" />
            <div className="w-5 h-0.5 bg-gray-700" />
          </button>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {profile ? (
              <>
                <Link
                  href={profile.user_type === "owner" ? "/dashboard/owner" : "/dashboard/student"}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  대시보드
                </Link>
                {profile.user_type === "owner" && (
                  <Link href="/explore/students" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                    대학생 탐색
                  </Link>
                )}
                {profile.user_type === "student" && (
                  <Link href="/explore/shops" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                    매장 탐색
                  </Link>
                )}
                <Link href="/matches" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  매칭 관리
                </Link>
                <Link href="/mypage" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  마이페이지
                </Link>
                <Link href={`/profile/${profile.user_id}`} className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  내 공개 프로필
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  로그인
                </Link>
                <Link href="/auth/signup" className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => setMenuOpen(false)}>
                  무료 시작하기
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

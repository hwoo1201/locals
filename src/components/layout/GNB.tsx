"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import LogoMark from "@/components/ui/LogoMark";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A14]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={28} color="#E8EDE6" />
            <span className="text-xl font-black text-[#E8EDE6] tracking-tight">솜씨</span>
            <span className="hidden sm:block text-xs text-[#6B6B5E] font-medium">소상공인 × 대학생</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-5">
            {profile ? (
              <>
                <Link href={profile.user_type === "owner" ? "/dashboard/owner" : "/dashboard/student"}
                  className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                  대시보드
                </Link>
                {profile.user_type === "owner" && (
                  <Link href="/explore/students" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                    대학생 탐색
                  </Link>
                )}
                {profile.user_type === "student" && (
                  <Link href="/explore/shops" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                    매장 탐색
                  </Link>
                )}
                <Link href="/matches" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                  매칭
                </Link>
                <Link href="/mypage" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                  마이페이지
                </Link>
                <Link href={`/profile/${profile.user_id}`} className="text-sm font-semibold text-[#D6A77A] hover:text-[#e0b88a] transition-colors">
                  {profile.name}
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-[#6B6B5E] hover:text-red-400 transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                  로그인
                </Link>
                <Link href="/auth/signup"
                  className="text-sm font-semibold bg-[#4A7C59] text-white px-4 py-2 rounded-xl hover:bg-[#3a6347] transition-colors">
                  무료 시작하기
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">
            <div className="w-5 h-0.5 bg-[#9B9B8E] mb-1.5" />
            <div className="w-5 h-0.5 bg-[#9B9B8E] mb-1.5" />
            <div className="w-5 h-0.5 bg-[#9B9B8E]" />
          </button>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#2C2C24] py-3 space-y-1">
            {profile ? (
              <>
                <Link href={profile.user_type === "owner" ? "/dashboard/owner" : "/dashboard/student"}
                  className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl"
                  onClick={() => setMenuOpen(false)}>대시보드</Link>
                {profile.user_type === "owner" && (
                  <Link href="/explore/students" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>대학생 탐색</Link>
                )}
                {profile.user_type === "student" && (
                  <Link href="/explore/shops" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>매장 탐색</Link>
                )}
                <Link href="/matches" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>매칭 관리</Link>
                <Link href="/mypage" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>마이페이지</Link>
                <Link href={`/profile/${profile.user_id}`} className="block px-3 py-2 text-sm font-medium text-[#D6A77A] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>내 공개 프로필</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/5 rounded-xl">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/auth/signup" className="block px-3 py-2 text-sm font-semibold text-[#4A7C59] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>무료 시작하기</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

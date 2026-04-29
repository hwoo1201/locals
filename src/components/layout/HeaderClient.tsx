"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import LogoMark from "@/components/ui/LogoMark";
import { BRAND } from "@/lib/brand";

export default function HeaderClient({ initialProfile }: { initialProfile: Profile | null }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfile(null); return; }
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data ?? null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
      } else if (event === "SIGNED_IN") {
        fetchProfile();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    showToast("로그아웃되었습니다");
    router.push("/");
    router.refresh();
  };

  const exploreHref = profile?.user_type === "owner" ? "/explore/students" : "/explore/shops";
  const exploreLabel = profile?.user_type === "owner" ? "마케터 탐색" : "사업 탐색";
  const dashboardHref = profile?.user_type === "owner" ? "/dashboard/owner" : "/dashboard/student";

  return (
    <>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#1A1A14] text-[#E8EDE6] text-sm font-medium px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A14]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark size={28} color="#E8EDE6" />
              <span className="text-xl font-black text-[#E8EDE6] tracking-tight">{BRAND.NAME_KO}</span>
              <span className="hidden sm:block text-xs text-[#6B6B5E] font-medium">{BRAND.TAGLINE}</span>
            </Link>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex items-center gap-5">
              {profile ? (
                <>
                  <Link href={exploreHref} className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                    {exploreLabel}
                  </Link>
                  <Link href="/matches" className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                    매칭
                  </Link>
                  <Link href={dashboardHref} className="text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] transition-colors">
                    대시보드
                  </Link>
                  <Link href="/mypage" className="text-sm font-semibold text-[#D6A77A] hover:text-[#e0b88a] transition-colors">
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
                  <Link href="/auth/signup" className="text-sm font-semibold bg-[#4A7C59] text-white px-4 py-2 rounded-xl hover:bg-[#3a6347] transition-colors">
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
                  <Link href={exploreHref} className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>
                    {exploreLabel}
                  </Link>
                  <Link href="/matches" className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>매칭 관리</Link>
                  <Link href={dashboardHref} className="block px-3 py-2 text-sm font-medium text-[#9B9B8E] hover:text-[#E8EDE6] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>대시보드</Link>
                  <Link href="/mypage" className="block px-3 py-2 text-sm font-medium text-[#D6A77A] hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>마이페이지 ({profile.name})</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/5 rounded-xl">로그아웃</button>
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
    </>
  );
}

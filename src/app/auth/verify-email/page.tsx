"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { AuthResponse } from "@supabase/supabase-js";
import { BRAND } from "@/lib/brand";
import LogoMark from "@/components/ui/LogoMark";

const COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    // 이미 인증된 세션이면 마이페이지로 리다이렉트
    supabase.auth.getSession().then((result: AuthResponse) => {
      if (result.data.session?.user?.email_confirmed_at) {
        router.replace("/mypage");
      }
    });
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResendLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    if (error) {
      showToast("error", error.message || "재발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } else {
      showToast("success", "인증 메일을 다시 보냈어요.");
      setCooldown(COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F0E2B0]">
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
          toast.type === "success"
            ? "bg-[#4A7C59] text-white"
            : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-12 h-12 bg-[#1A1A14] rounded-2xl flex items-center justify-center shadow-md">
              <LogoMark size={28} color="#E8EDE6" />
            </div>
            <span className="text-2xl font-black text-[#1A1A14] tracking-tight">{BRAND.NAME_KO}</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#D6A77A]/20 p-8">
          {/* 아이콘 */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-[#E8EDE6] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-black text-[#1A1A14] text-center mb-2">
            인증 메일을 보냈어요
          </h1>

          {email && (
            <p className="text-sm text-[#5A5A4E] text-center mb-6 leading-relaxed">
              <strong className="text-[#1A1A14]">{email}</strong>으로<br />
              인증 메일이 발송되었습니다.<br />
              잠시 후 받은편지함을 확인해주세요.
            </p>
          )}

          {/* 안내 박스 */}
          <div className="bg-[#F0E2B0]/60 border border-[#D6A77A]/40 rounded-2xl px-4 py-4 mb-6 space-y-2 text-xs text-[#5A5A4E]">
            <p className="font-semibold text-[#1A1A14] mb-2">메일이 안 보이시나요?</p>
            <div className="flex gap-2">
              <span className="text-[#D6A77A] font-bold">·</span>
              <span>발신자: <strong>{BRAND.EMAIL_SENDER_NAME} &lt;{BRAND.EMAIL}&gt;</strong></span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#D6A77A] font-bold">·</span>
              <span>제목: <strong>&ldquo;{BRAND.NAME_KO} 이메일 인증을 완료해주세요&rdquo;</strong></span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#D6A77A] font-bold">·</span>
              <span>스팸함 / 정크메일함도 확인해주세요</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#D6A77A] font-bold">·</span>
              <span>Gmail 사용자라면 &ldquo;프로모션&rdquo; 탭도 확인해주세요</span>
            </div>
          </div>

          {/* 재발송 버튼 */}
          <button
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0 || !email}
            className="w-full bg-[#2C3E50] hover:bg-[#3d5166] disabled:bg-[#8A8A7E] text-white font-bold py-3 rounded-2xl transition-colors text-sm"
          >
            {resendLoading
              ? "발송 중..."
              : cooldown > 0
              ? `다시 보내기 (${cooldown}초)`
              : "인증 메일 다시 보내기"}
          </button>

          <div className="mt-4 text-center">
            <Link
              href="/auth/signup"
              className="text-xs text-[#8A8A7E] hover:text-[#5A5A4E] transition-colors"
            >
              이메일 주소가 잘못됐나요? 다시 회원가입하기
            </Link>
          </div>
        </div>

        <p className="text-center mt-5 text-xs text-[#8A8A7E]">
          이미 인증하셨나요?{" "}
          <Link href="/auth/login" className="text-[#4A7C59] font-semibold hover:underline">
            로그인하러 가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F0E2B0]">
        <div className="w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

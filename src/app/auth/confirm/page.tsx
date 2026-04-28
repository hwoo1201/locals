"use client";
import { BRAND_NAME } from "@/lib/brand";

// Supabase 이메일 인증 링크 클릭 후 도착하는 콜백 페이지
// Supabase > Authentication > URL Configuration > Redirect URLs에 추가 필요:
//   https://{your-domain}/auth/confirm
//   http://localhost:3000/auth/confirm

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (!token_hash || !type) {
        // URL 해시(#access_token=...) 방식 처리 — Supabase가 자동으로 세션 복원
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          setTimeout(() => router.push("/auth/login"), 2500);
        } else {
          setStatus("error");
          setErrorMessage("유효하지 않은 인증 링크입니다.");
        }
        return;
      }

      // token_hash 방식 처리
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "signup" });
      if (error) {
        setStatus("error");
        setErrorMessage("인증에 실패했습니다. 링크가 만료되었거나 이미 사용된 링크입니다.");
        return;
      }

      await supabase.auth.signOut(); // 인증 후 로그아웃 (로그인 페이지에서 다시 로그인)
      setStatus("success");
      setTimeout(() => router.push("/auth/login"), 2500);
    };

    verify();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 font-medium">이메일 인증 확인 중...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-lg">이메일 인증 완료!</p>
          <p className="text-sm text-gray-500 mt-1">잠시 후 로그인 페이지로 이동합니다.</p>
        </div>
        <Link href="/auth/login" className="btn-primary inline-block">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-gray-900 text-lg">인증 실패</p>
        <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
      </div>
      <Link href="/auth/signup" className="btn-primary inline-block">
        다시 회원가입하기
      </Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-[#2C3E50] mb-2">
            {BRAND_NAME}
          </Link>
        </div>
        <div className="card">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ConfirmContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

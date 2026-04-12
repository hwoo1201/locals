"use client";

// [Supabase 설정 필요]
// Authentication > URL Configuration > Redirect URLs에 아래 URL 추가:
//   https://{your-domain}/auth/reset-password
// 로컬 개발 시: http://localhost:3000/auth/reset-password

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError("이메일 전송에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-blue-600 mb-2">
            LOCALS
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
          <p className="text-gray-500 mt-1">가입한 이메일로 재설정 링크를 보내드려요</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">이메일을 확인해주세요</p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  이메일이 보이지 않으면 스팸함을 확인해주세요.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm text-blue-600 hover:underline"
              >
                다른 이메일로 다시 시도
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">가입한 이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="input-field"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center"
              >
                {loading ? "전송 중..." : "비밀번호 재설정 링크 보내기"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

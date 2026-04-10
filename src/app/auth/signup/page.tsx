"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { UserType } from "@/types";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as UserType) || null;

  const [userType, setUserType] = useState<UserType | null>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      setError("회원 유형을 선택해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    // 1. 서버 API로 유저+프로필 동시 생성 (RLS 우회)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone, region, userType }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "회원가입에 실패했습니다.");
      setLoading(false);
      return;
    }

    // 2. 클라이언트 로그인 (생성된 계정으로)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError("가입은 됐으나 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    if (userType === "owner") {
      router.push("/shop/register?new=1");
    } else {
      router.push("/student-profile/register?new=1");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-blue-600 mb-2">
            LOCALS
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-500 mt-1">무료로 시작하세요</p>
        </div>

        <div className="card">
          {/* 유형 선택 */}
          <div className="mb-6">
            <p className="label mb-3">회원 유형 선택 *</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("owner")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  userType === "owner"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="font-semibold text-sm">소상공인</div>
                <div className="text-xs text-gray-500 mt-0.5">마케팅이 필요해요</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  userType === "student"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="font-semibold text-sm">대학생</div>
                <div className="text-xs text-gray-500 mt-0.5">경험을 쌓고 싶어요</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">이메일 *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label">비밀번호 *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 6자 이상"
                required
                minLength={6}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">활동 지역</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="예: 서울 강남구"
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
              disabled={loading || !userType}
              className="btn-primary w-full text-center mt-2"
            >
              {loading ? "가입 중..." : "회원가입 완료"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <SignupForm />
    </Suspense>
  );
}

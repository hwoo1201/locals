"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/lib/supabase";
import type { UserType } from "@/types";

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "8자 이상", test: (pw) => pw.length >= 8 },
  { label: "숫자 포함", test: (pw) => /[0-9]/.test(pw) },
  { label: "특수문자 포함", test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {PASSWORD_RULES.map(({ label, test }) => {
        const ok = test(password);
        return (
          <span
            key={label}
            className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}
          >
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${ok ? "bg-green-500" : "bg-gray-300"}`}>
              ✓
            </span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace("/");
    };
    void check();
  }, [router]);
  const initialType = (searchParams.get("type") as UserType) || null;

  const [userType, setUserType] = useState<UserType | null>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [commissionAgreed, setCommissionAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPasswordValid = PASSWORD_RULES.every(({ test }) => test(password));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      setError("회원 유형을 선택해주세요.");
      return;
    }
    if (!isPasswordValid) {
      setError("비밀번호 조건을 모두 충족해주세요.");
      return;
    }
    if (userType === "student" && !commissionAgreed) {
      setError("수수료 정책에 동의해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, phone, region, userType }),
    });

    const json = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(json.error || "회원가입에 실패했습니다.");
      return;
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F0E2B0]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-[#1A1A14] mb-2">
            {BRAND.NAME_KO}
          </Link>
          <h1 className="text-2xl font-bold text-[#1A1A14]">회원가입</h1>
          <p className="text-[#8A8A7E] mt-1">무료로 시작하세요</p>
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
                    ? "border-[#2C3E50] bg-[#2C3E50]/5 text-[#2C3E50]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="font-semibold text-sm">사업주</div>
                <div className="text-xs text-gray-500 mt-0.5">마케팅이 필요해요</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  userType === "student"
                    ? "border-[#4A7C59] bg-[#4A7C59]/5 text-[#4A7C59]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="font-semibold text-sm">마케터</div>
                <div className="text-xs text-gray-500 mt-0.5">경험과 수익을 원해요</div>
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
                placeholder="8자 이상, 숫자·특수문자 포함"
                required
                minLength={8}
                className="input-field"
              />
              <PasswordStrength password={password} />
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

            {/* 대학생 수수료 안내 */}
            {userType === "student" && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-orange-800 mb-1">수수료 안내</p>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    {BRAND.NAME_KO}는 매칭 성사 시 <strong>첫 달 급여의 20%</strong>를 수수료로 <strong>1회만</strong> 받습니다.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">이후 추가 비용은 없습니다.</p>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={commissionAgreed}
                    onChange={(e) => setCommissionAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-orange-300 accent-orange-500 flex-shrink-0"
                  />
                  <span className="text-xs font-semibold text-orange-800">
                    수수료 정책에 동의합니다 (필수)
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !userType || (userType === "student" && !commissionAgreed)}
              className="btn-primary w-full text-center mt-2"
            >
              {loading ? "가입 중..." : "회원가입 완료"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-[#4A7C59] font-semibold hover:underline">
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

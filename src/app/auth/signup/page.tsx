"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const [sent, setSent] = useState(false);

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

    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-3xl font-black text-blue-600 mb-2">
              LOCALS
            </Link>
          </div>
          <div className="card text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">인증 이메일을 보냈습니다</p>
              <p className="text-sm text-gray-500 mt-2">
                <strong>{email}</strong>로 인증 링크를 발송했습니다.<br />
                이메일을 확인하고 링크를 클릭해주세요.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                이메일이 보이지 않으면 스팸함을 확인해주세요.
              </p>
            </div>
            <Link href="/auth/login" className="btn-primary inline-block mt-2">
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

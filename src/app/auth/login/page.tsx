"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      if (!data.user) {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      // user_metadata에서 user_type 확인 (DB 쿼리 불필요)
      const userType = data.user.user_metadata?.user_type;

      if (userType === "owner") {
        router.push("/dashboard/owner");
      } else if (userType === "student") {
        router.push("/dashboard/student");
      } else {
        // 구형 계정: DB에서 조회
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("user_id", data.user.id)
          .single();

        if (profile?.user_type === "owner") {
          router.push("/dashboard/owner");
        } else if (profile?.user_type === "student") {
          router.push("/dashboard/student");
        } else {
          router.push("/dashboard/owner");
        }
      }

      router.refresh();
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-black text-blue-600 mb-2">
            솜씨
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-500 mt-1">계정에 로그인하세요</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">이메일</label>
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
              <div className="flex items-center justify-between mb-1">
                <label className="label">비밀번호</label>
                <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
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
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

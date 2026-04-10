"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface Props {
  projectId: string;
}

export default function CompleteProjectButton({ projectId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/project/${projectId}/complete`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || "오류가 발생했습니다.";
        setError(msg);
        showToast(msg, "error");
        return;
      }
      showToast("프로젝트가 완료 처리됐습니다.", "success");
      router.refresh();
    } catch {
      const msg = "서버 오류가 발생했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-semibold hover:border-green-400 hover:text-green-600 transition-colors"
      >
        프로젝트 완료 처리
      </button>
    );
  }

  return (
    <div className="card border-2 border-green-200 bg-green-50 space-y-3">
      <p className="font-semibold text-green-800 text-sm">
        프로젝트를 완료 처리하시겠습니까?
      </p>
      <p className="text-xs text-green-700">
        완료 후 양쪽 모두 서로를 리뷰할 수 있습니다. 이 작업은 되돌릴 수 없습니다.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium"
        >
          취소
        </button>
        <button
          onClick={handleComplete}
          disabled={loading}
          className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? "처리 중..." : "완료 확인"}
        </button>
      </div>
    </div>
  );
}

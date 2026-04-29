"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  wrong_user_type: "해당 페이지에 접근할 수 없는 계정 유형입니다.",
};

function ErrorToastInner() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const [toast, setToast] = useState(errorCode ? (ERROR_MESSAGES[errorCode] ?? "") : "");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg bg-red-500 text-white">
      {toast}
    </div>
  );
}

export default function ErrorToast() {
  return (
    <Suspense fallback={null}>
      <ErrorToastInner />
    </Suspense>
  );
}

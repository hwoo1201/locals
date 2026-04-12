"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-black text-red-500 mb-4">500</p>
      <h1 className="text-2xl font-black text-gray-900 mb-2">오류가 발생했습니다</h1>
      <p className="text-gray-500 mb-8">
        일시적인 오류입니다. 잠시 후 다시 시도해주세요.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          다시 시도
        </button>
        <Link href="/" className="btn-secondary">
          홈으로 가기
        </Link>
      </div>
    </div>
  );
}

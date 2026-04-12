"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <html lang="ko">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-6xl font-black text-red-500 mb-4">500</p>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            문제가 발생했습니다
          </h1>
          <p className="text-gray-500 mb-8">
            잠시 후 다시 시도해주세요. 문제가 계속되면 문의해주세요.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
            <Link
              href="/"
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

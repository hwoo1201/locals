"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface Props {
  projectId: string;
  reviews: Review[];
  reviewerNames: Record<string, string>; // reviewer_id → name
  currentUserId: string;
  ownerUserId: string;
  studentUserId: string;
  isOwner: boolean;
  isStudent: boolean;
  hasReviewed: boolean;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
            value >= n
              ? "bg-yellow-400 text-white"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-bold text-yellow-500 text-sm">{rating}.0</span>
      <span className="text-xs text-gray-400">/ 5</span>
    </span>
  );
}

export default function ReviewSection({
  projectId,
  reviews,
  reviewerNames,
  currentUserId,
  ownerUserId,
  studentUserId,
  isOwner,
  isStudent,
  hasReviewed,
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 내가 리뷰할 상대방 (소상공인 → 대학생, 대학생 → 소상공인)
  const revieweeId = isOwner ? studentUserId : ownerUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          reviewee_id: revieweeId,
          rating,
          content,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || "오류가 발생했습니다.";
        setError(msg);
        showToast(msg, "error");
        return;
      }
      setSubmitted(true);
      showToast("리뷰가 제출됐습니다.", "success");
      router.refresh();
    } catch {
      const msg = "서버 오류가 발생했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const canReview = (isOwner || isStudent) && !hasReviewed && !submitted;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-gray-900 text-lg">리뷰</h2>

      {/* 리뷰 작성 폼 */}
      {canReview && (
        <div className="card border-2 border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">
            파트너에 대한 리뷰를 작성해주세요
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="label mb-2">별점</p>
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-gray-400 mt-1">{rating}점 선택됨</p>
            </div>
            <div>
              <label className="label">후기 (선택)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="협업 경험을 공유해주세요..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "제출 중..." : "리뷰 제출"}
            </button>
          </form>
        </div>
      )}

      {(hasReviewed || submitted) && (
        <div className="card bg-green-50 border border-green-200">
          <p className="text-sm font-medium text-green-700">리뷰를 작성했습니다.</p>
        </div>
      )}

      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {reviewerNames[review.reviewer_id] || "익명"}
                  {review.reviewer_id === currentUserId && (
                    <span className="ml-1 text-xs text-blue-600">(나)</span>
                  )}
                </span>
                <StarDisplay rating={review.rating} />
              </div>
              {review.content && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {review.content}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(review.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          아직 작성된 리뷰가 없습니다
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  targetName: string;
  shopName?: string;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export default function MatchRequestModal({ targetName, shopName, onClose, onSubmit }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">매칭 요청</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {shopName ? `${shopName}` : targetName}에게 요청을 보냅니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">
              메시지 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`${targetName}님에게 전하고 싶은 말을 적어주세요.\n예: 저는 인스타그램 릴스 제작에 강점이 있는 대학생입니다. 함께 일하고 싶습니다!`}
              rows={5}
              maxLength={500}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? "전송 중..." : "요청 보내기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

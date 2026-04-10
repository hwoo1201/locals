"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Metric, CustomField } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface Props {
  projectId: string;
  measuredAt: "before" | "after";
  existing: Metric | null;
}

const FIELDS = [
  { key: "followers", label: "팔로워 수", placeholder: "예: 1200" },
  { key: "visitors", label: "일평균 방문자 수", placeholder: "예: 80" },
  { key: "revenue", label: "월 매출 (만원)", placeholder: "예: 300" },
  { key: "posts_count", label: "게시물 수", placeholder: "예: 24" },
  { key: "likes", label: "평균 좋아요 수", placeholder: "예: 45" },
] as const;

export default function MetricsForm({ projectId, measuredAt, existing }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const [values, setValues] = useState<Record<string, string>>({
    followers: existing?.followers?.toString() ?? "",
    visitors: existing?.visitors?.toString() ?? "",
    revenue: existing?.revenue?.toString() ?? "",
    posts_count: existing?.posts_count?.toString() ?? "",
    likes: existing?.likes?.toString() ?? "",
  });

  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    existing?.custom_fields?.map((f: CustomField) => ({
      key: f.key,
      value: String(f.value),
    })) ?? []
  );

  const [newFieldKey, setNewFieldKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const addCustomField = () => {
    if (!newFieldKey.trim()) return;
    setCustomFields((prev) => [...prev, { key: newFieldKey.trim(), value: "" }]);
    setNewFieldKey("");
  };

  const removeCustomField = (idx: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCustomField = (idx: number, field: "key" | "value", val: string) => {
    setCustomFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          measured_at: measuredAt,
          ...Object.fromEntries(
            Object.entries(values).map(([k, v]) => [k, v !== "" ? Number(v) : null])
          ),
          custom_fields: customFields
            .filter((f) => f.key.trim() && f.value !== "")
            .map((f) => ({ key: f.key.trim(), value: Number(f.value) })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || "저장에 실패했습니다.";
        setError(msg);
        showToast(msg, "error");
        return;
      }
      setSaved(true);
      showToast("데이터가 저장됐습니다.", "success");
      router.refresh();
    } catch {
      const msg = "서버 오류가 발생했습니다.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 고정 필드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="label">{field.label}</label>
            <input
              type="number"
              min="0"
              value={values[field.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
              className="input-field"
            />
          </div>
        ))}
      </div>

      {/* 커스텀 필드 */}
      {customFields.length > 0 && (
        <div className="space-y-2">
          <p className="label">추가 항목</p>
          {customFields.map((f, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={f.key}
                onChange={(e) => updateCustomField(idx, "key", e.target.value)}
                placeholder="항목명"
                className="input-field flex-1"
              />
              <input
                type="number"
                min="0"
                value={f.value}
                onChange={(e) => updateCustomField(idx, "value", e.target.value)}
                placeholder="수치"
                className="input-field w-28"
              />
              <button
                type="button"
                onClick={() => removeCustomField(idx)}
                className="text-gray-400 hover:text-red-400 text-sm px-2 py-1 transition-colors"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 커스텀 필드 추가 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newFieldKey}
          onChange={(e) => setNewFieldKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustomField();
            }
          }}
          placeholder="예약수, 전화문의, 인스타 DM 등 직접 입력"
          className="input-field flex-1 text-sm"
        />
        <button
          type="button"
          onClick={addCustomField}
          className="btn-secondary text-sm px-4 whitespace-nowrap"
        >
          항목 추가
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && (
        <p className="text-sm text-green-600 font-medium">저장됐습니다.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Metric } from "@/types";

interface Props {
  before: Metric | null;
  after: Metric | null;
  projectId: string;
  isOwner: boolean;
}

const FIXED_LABELS: Record<string, string> = {
  followers: "팔로워",
  visitors: "일평균 방문자",
  revenue: "월 매출(만원)",
  posts_count: "게시물 수",
  likes: "평균 좋아요",
};

function buildChartData(before: Metric | null, after: Metric | null) {
  const entries: { name: string; before?: number; after?: number }[] = [];

  for (const [key, label] of Object.entries(FIXED_LABELS)) {
    const b = before?.[key as keyof Metric] as number | null | undefined;
    const a = after?.[key as keyof Metric] as number | null | undefined;
    if (b != null || a != null) {
      entries.push({ name: label, before: b ?? undefined, after: a ?? undefined });
    }
  }

  const allCustomKeys = Array.from(new Set([
    ...(before?.custom_fields?.map((f) => f.key) ?? []),
    ...(after?.custom_fields?.map((f) => f.key) ?? []),
  ]));
  for (const key of allCustomKeys) {
    entries.push({
      name: key,
      before: before?.custom_fields?.find((f) => f.key === key)?.value,
      after: after?.custom_fields?.find((f) => f.key === key)?.value,
    });
  }

  return entries;
}

function ChangeCard({
  name,
  before,
  after,
}: {
  name: string;
  before?: number;
  after?: number;
}) {
  const hasAfter = after != null;
  const hasBefore = before != null;
  const change = (after ?? 0) - (before ?? 0);
  const pct =
    hasBefore && before! > 0
      ? ((change / before!) * 100).toFixed(1)
      : null;
  const isUp = change > 0;
  const isZero = change === 0;

  return (
    <div className="card text-center py-5">
      <p className="text-xs text-gray-500 mb-1">{name}</p>
      <p className="text-2xl font-black text-gray-900">
        {hasAfter ? after!.toLocaleString() : "-"}
      </p>
      {hasBefore && (
        <p className="text-xs text-gray-400 mt-0.5">
          이전: {before!.toLocaleString()}
        </p>
      )}
      {hasAfter && hasBefore && !isZero && (
        <p
          className={`text-sm font-bold mt-1 ${
            isUp ? "text-green-600" : "text-red-500"
          }`}
        >
          {isUp ? "▲" : "▼"} {Math.abs(change).toLocaleString()}
          {pct && ` (${Math.abs(Number(pct))}%)`}
        </p>
      )}
      {hasAfter && hasBefore && isZero && (
        <p className="text-sm text-gray-400 mt-1">변화 없음</p>
      )}
    </div>
  );
}

export default function ProjectAnalytics({
  before,
  after,
  projectId,
  isOwner,
}: Props) {
  if (!before) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-500 font-medium mb-1">
          아직 데이터가 입력되지 않았습니다
        </p>
        <p className="text-sm text-gray-400 mb-4">
          마케팅 시작 전 기초 데이터를 입력하면 효과를 측정할 수 있어요
        </p>
        {isOwner && (
          <Link
            href={`/project/${projectId}/metrics`}
            className="btn-primary inline-block"
          >
            기초 데이터 입력하기
          </Link>
        )}
      </div>
    );
  }

  const chartData = buildChartData(before, after);

  if (!after) {
    return (
      <div className="space-y-4">
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-1">
            기초 데이터 입력 완료
          </p>
          <p className="text-xs text-blue-600">
            마케팅 완료 후 종료 데이터를 입력하면 전후 비교 차트를 볼 수 있어요
          </p>
          {isOwner && (
            <Link
              href={`/project/${projectId}/metrics`}
              className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
            >
              종료 데이터 입력하기 →
            </Link>
          )}
        </div>

        {/* 기초 데이터 요약 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {chartData.map((item) => (
            <div key={item.name} className="card text-center py-4">
              <p className="text-xs text-gray-500 mb-1">{item.name}</p>
              <p className="text-xl font-black text-gray-900">
                {item.before?.toLocaleString() ?? "-"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">마케팅 전</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 전후 비교 풀 뷰
  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">지표별 변화</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {chartData.map((item) => (
            <ChangeCard
              key={item.name}
              name={item.name}
              before={item.before}
              after={item.after}
            />
          ))}
        </div>
      </div>

      {/* 바 차트 */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">전후 비교 차트</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip
                formatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend
                formatter={(value) => (value === "before" ? "마케팅 전" : "마케팅 후")}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="before" fill="#d1d5db" name="before" radius={[3, 3, 0, 0]} />
              <Bar dataKey="after" fill="#2563eb" name="after" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isOwner && (
        <div className="text-right">
          <Link
            href={`/project/${projectId}/metrics`}
            className="text-sm text-blue-600 hover:underline"
          >
            데이터 수정하기 →
          </Link>
        </div>
      )}
    </div>
  );
}

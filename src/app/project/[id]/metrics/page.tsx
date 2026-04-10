import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Project, Shop, Metric } from "@/types";
import MetricsForm from "@/components/project/MetricsForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MetricsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single<Project>();

  if (!project) notFound();

  const [{ data: shop }, { data: beforeMetric }, { data: afterMetric }] = await Promise.all([
    supabase.from("shops").select("*").eq("id", project.shop_id).single<Shop>(),
    supabase.from("metrics").select("*").eq("project_id", id).eq("measured_at", "before").maybeSingle<Metric>(),
    supabase.from("metrics").select("*").eq("project_id", id).eq("measured_at", "after").maybeSingle<Metric>(),
  ]);

  // 접근 권한 확인
  const isOwner = shop?.owner_id === user.id;
  const isStudent = project.student_id === user.id;
  if (!isOwner && !isStudent) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <Link
          href={`/project/${id}`}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 프로젝트로 돌아가기
        </Link>
        <h1 className="text-2xl font-black text-gray-900">마케팅 데이터 입력</h1>
        <p className="text-gray-500 mt-1">{shop?.name}</p>
      </div>

      {!isOwner && (
        <div className="card bg-gray-50 text-center py-6">
          <p className="text-gray-500 text-sm">
            소상공인만 데이터를 입력할 수 있습니다. 데이터가 입력되면 여기서 확인할 수 있어요.
          </p>
        </div>
      )}

      {isOwner && (
        <>
          {/* 마케팅 전 */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">마케팅 전 데이터</h2>
              {beforeMetric ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  입력됨
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                  미입력
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              마케팅 시작 전 현재 상태를 입력해주세요.
            </p>
            <MetricsForm
              projectId={id}
              measuredAt="before"
              existing={beforeMetric}
            />
          </div>

          {/* 마케팅 후 */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">마케팅 후 데이터</h2>
              {afterMetric ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  입력됨
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                  미입력
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              마케팅 종료 후 변화된 수치를 입력해주세요.
            </p>
            {!beforeMetric && (
              <p className="text-xs text-orange-500">
                마케팅 전 데이터를 먼저 입력한 후 종료 데이터를 입력하세요.
              </p>
            )}
            <MetricsForm
              projectId={id}
              measuredAt="after"
              existing={afterMetric}
            />
          </div>
        </>
      )}
    </div>
  );
}

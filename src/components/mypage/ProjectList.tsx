"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
  shopNames: Record<string, string>;
}

type Tab = "active" | "completed";

export default function ProjectList({ projects, shopNames }: Props) {
  const [tab, setTab] = useState<Tab>("active");

  const filtered = projects.filter((p) => p.status === tab);

  if (projects.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-gray-500 font-medium mb-1">아직 진행 중인 프로젝트가 없습니다</p>
        <p className="text-sm text-gray-400">매칭이 수락되면 프로젝트가 생성됩니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            tab === "active"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          진행 중 ({projects.filter((p) => p.status === "active").length})
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            tab === "completed"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          완료 ({projects.filter((p) => p.status === "completed").length})
        </button>
      </div>

      {/* 목록 */}
      {filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-sm text-gray-400">
            {tab === "active" ? "진행 중인 프로젝트가 없습니다" : "완료된 프로젝트가 없습니다"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              shopName={shopNames[project.shop_id] || "매장"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, shopName }: { project: Project; shopName: string }) {
  const daysLeft =
    project.end_date
      ? Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000))
      : null;

  const progressPercent =
    project.start_date && project.end_date
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((Date.now() - new Date(project.start_date).getTime()) /
                (new Date(project.end_date).getTime() -
                  new Date(project.start_date).getTime())) *
                100
            )
          )
        )
      : 0;

  return (
    <Link href={`/project/${project.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  project.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {project.status === "active" ? "진행 중" : "완료"}
              </span>
            </div>
            <p className="font-semibold text-gray-900 truncate">{shopName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {project.start_date
                ? new Date(project.start_date).toLocaleDateString("ko-KR")
                : "-"}
              {project.end_date &&
                ` ~ ${new Date(project.end_date).toLocaleDateString("ko-KR")}`}
            </p>
          </div>
          {project.status === "active" && daysLeft !== null && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">남은 기간</p>
              <p className="text-sm font-bold text-gray-800">{daysLeft}일</p>
            </div>
          )}
        </div>

        {project.status === "active" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>진행률</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

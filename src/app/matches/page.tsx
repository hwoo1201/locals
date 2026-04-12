"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { MatchRequest, Profile, Shop } from "@/types";

type Tab = "received" | "sent";

interface MatchWithDetails extends MatchRequest {
  otherParty: Profile | null;
  shop: Shop | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: "대기 중",  color: "bg-yellow-100 text-yellow-700" },
  accepted: { label: "수락됨",   color: "bg-green-100 text-green-700"  },
  rejected: { label: "거절됨",   color: "bg-red-100 text-red-600"      },
};

export default function MatchesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<MatchWithDetails[]>([]);
  const [sent, setSent] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [acceptingMatchId, setAcceptingMatchId] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(4);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const [{ data: recvData }, { data: sentData }] = await Promise.all([
        supabase.from("match_requests").select("*").eq("target_id", user.id).order("created_at", { ascending: false }),
        supabase.from("match_requests").select("*").eq("requester_id", user.id).order("created_at", { ascending: false }),
      ]);

      // 관련 프로필 + 매장 일괄 조회
      const allUserIds = new Set([
        ...(recvData || []).map((r: MatchRequest) => r.requester_id),
        ...(sentData || []).map((r: MatchRequest) => r.target_id),
      ]);
      const allShopIds = new Set([
        ...(recvData || []).map((r: MatchRequest) => r.shop_id),
        ...(sentData || []).map((r: MatchRequest) => r.shop_id),
      ]);

      const [{ data: profilesData }, { data: shopsData }] = await Promise.all([
        allUserIds.size > 0
          ? supabase.from("profiles").select("*").in("user_id", Array.from(allUserIds))
          : Promise.resolve({ data: [] }),
        allShopIds.size > 0
          ? supabase.from("shops").select("*").in("id", Array.from(allShopIds))
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map<string, Profile>((profilesData || []).map((p: Profile) => [p.user_id, p]));
      const shopMap = new Map<string, Shop>((shopsData || []).map((s: Shop) => [s.id, s]));

      const enrich = (items: MatchRequest[], otherKey: "requester_id" | "target_id"): MatchWithDetails[] =>
        (items || []).map((r) => ({
          ...r,
          otherParty: profileMap.get(r[otherKey]) || null,
          shop: shopMap.get(r.shop_id) || null,
        }));

      setReceived(enrich(recvData || [], "requester_id"));
      setSent(enrich(sentData || [], "target_id"));
      setLoading(false);
    };
    load();
  }, [router]);

  const handleRespond = async (matchId: string, action: "accept" | "reject", durationWeeks?: number) => {
    setResponding(matchId);
    const res = await fetch("/api/match/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: matchId, action, duration_weeks: durationWeeks }),
    });

    if (res.ok) {
      const json = await res.json();
      setReceived((prev) =>
        prev.map((r) =>
          r.id === matchId
            ? { ...r, status: action === "accept" ? "accepted" : "rejected" }
            : r
        )
      );
      if (json.warning) {
        setToast(json.warning);
        setTimeout(() => setToast(null), 4000);
      }
    }
    setResponding(null);
    setAcceptingMatchId(null);
  };

  const currentList = tab === "received" ? received : sent;
  const receivedPending = received.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">매칭 관리</h1>
        <p className="text-gray-500 mt-1">보내고 받은 매칭 요청을 확인하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab("received")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
            tab === "received"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          받은 요청
          {receivedPending > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {receivedPending}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "sent"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          보낸 요청
        </button>
      </div>

      {/* 리스트 */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">
            {tab === "received" ? "받은 요청이 없습니다" : "보낸 요청이 없습니다"}
          </p>
          {tab === "sent" && (
            <Link href="/explore/students" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              대학생 탐색하러 가기 →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((match) => (
            <div key={match.id} className="card">
              <div className="flex items-start gap-4">
                {/* 아바타 */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  match.otherParty?.user_type === "owner" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                }`}>
                  {match.otherParty?.user_type === "owner" ? "사장님" : "대학생"}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 이름 + 상태 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/profile/${match.otherParty?.user_id || ""}`}
                      className="font-bold text-gray-900 hover:text-blue-600"
                    >
                      {match.otherParty?.name || "알 수 없음"}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_LABEL[match.status]?.color}`}>
                      {STATUS_LABEL[match.status]?.label}
                    </span>
                  </div>

                  {/* 매장 정보 */}
                  {match.shop && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {match.shop.name} ({match.shop.category})
                    </p>
                  )}

                  {/* 메시지 */}
                  {match.message && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2 line-clamp-2">
                      &quot;{match.message}&quot;
                    </p>
                  )}

                  {/* 날짜 */}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(match.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>

              {/* 액션 버튼 (받은 요청 + pending 상태일 때만) */}
              {tab === "received" && match.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {acceptingMatchId === match.id ? (
                    /* 기간 선택 UI */
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">프로젝트 기간 선택</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([2, 4, 8] as const).map((weeks) => (
                          <button
                            key={weeks}
                            type="button"
                            onClick={() => setSelectedWeeks(weeks)}
                            className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                              selectedWeeks === weeks
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {weeks === 2 ? "2주\n단기 테스트" : weeks === 4 ? "4주\n기본" : "8주\n장기"}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAcceptingMatchId(null)}
                          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleRespond(match.id, "accept", selectedWeeks)}
                          disabled={responding === match.id}
                          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {responding === match.id ? "처리 중..." : `${selectedWeeks}주로 수락`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(match.id, "reject")}
                        disabled={responding === match.id}
                        className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        거절
                      </button>
                      <button
                        onClick={() => { setAcceptingMatchId(match.id); setSelectedWeeks(4); }}
                        disabled={responding === match.id}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        수락
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 수락됨 → 연락처 + 프로젝트 보기 */}
              {match.status === "accepted" && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {match.otherParty?.contact_method ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <p className="text-xs text-green-600 font-medium mb-0.5">상대방 연락처</p>
                      <p className="text-sm font-semibold text-green-800">
                        {match.otherParty.contact_method}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">상대방이 아직 연락처를 등록하지 않았습니다</p>
                  )}
                  <Link
                    href="/matches"
                    className="text-sm text-blue-600 hover:underline font-medium block"
                  >
                    매칭 성사! 프로젝트를 확인하세요 →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

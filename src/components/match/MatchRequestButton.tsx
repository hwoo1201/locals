"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MatchRequestModal from "./MatchRequestModal";

interface Props {
  currentUserId: string;
  currentUserType: "owner" | "student";
  currentUserShopId?: string;       // 내가 owner일 때 내 shop id
  targetUserId: string;
  targetName: string;
  targetShopId?: string;            // 상대가 owner일 때 상대 shop id
  targetShopName?: string;
  existingStatus?: "pending" | "accepted" | "rejected" | null;
  avgPayHint?: number | null;       // pay_stats 기반 평균 급여 힌트
}

export default function MatchRequestButton({
  currentUserType,
  currentUserShopId,
  targetUserId,
  targetName,
  targetShopId,
  targetShopName,
  existingStatus,
  avgPayHint,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState(existingStatus);
  const [toast, setToast] = useState<string | null>(null);

  // 소상공인 → 대학생: shop_id = 내 shop
  // 대학생 → 소상공인: shop_id = 상대 shop
  const shopId = currentUserType === "owner" ? currentUserShopId : targetShopId;
  const shopName = currentUserType === "owner"
    ? (currentUserShopId ? "내 매장" : undefined)
    : targetShopName;

  if (!shopId) {
    if (currentUserType === "owner") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          매칭 요청을 하려면 먼저{" "}
          <a href="/shop/register" className="font-semibold underline">매장을 등록</a>
          해주세요.
        </div>
      );
    }
    return null;
  }

  if (done || status === "pending") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 font-medium">
        매칭 요청을 보냈습니다. 상대방의 답변을 기다려주세요.
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
        이미 매칭된 파트너입니다!
      </div>
    );
  }

  const handleSubmit = async (message: string, proposedPay: number | null) => {
    const res = await fetch("/api/match/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: targetUserId,
        shop_id: shopId,
        message,
        proposed_pay: proposedPay,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "요청 실패");

    setDone(true);
    setStatus("pending");
    setModalOpen(false);
    router.refresh();

    if (json.warning) {
      setToast(json.warning);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
      <button
        onClick={() => setModalOpen(true)}
        className="btn-primary w-full text-center"
      >
        매칭 요청하기
      </button>

      {modalOpen && (
        <MatchRequestModal
          targetName={targetName}
          shopName={shopName}
          avgPayHint={avgPayHint}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

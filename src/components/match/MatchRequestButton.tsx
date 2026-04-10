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
}

export default function MatchRequestButton({
  currentUserType,
  currentUserShopId,
  targetUserId,
  targetName,
  targetShopId,
  targetShopName,
  existingStatus,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState(existingStatus);

  // 매칭 요청 가능 여부 체크
  // 소상공인 → 대학생: shop_id = 내 shop
  // 대학생 → 소상공인: shop_id = 상대 shop
  const shopId = currentUserType === "owner" ? currentUserShopId : targetShopId;
  const shopName = currentUserType === "owner"
    ? (currentUserShopId ? "내 매장" : undefined)
    : targetShopName;

  if (!shopId) {
    // 소상공인인데 매장 미등록
    if (currentUserType === "owner") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          매칭 요청을 하려면 먼저{" "}
          <a href="/shop/register" className="font-semibold underline">매장을 등록</a>
          해주세요.
        </div>
      );
    }
    // 대학생인데 상대 shop 없음
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

  const handleSubmit = async (message: string) => {
    const res = await fetch("/api/match/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: targetUserId,
        shop_id: shopId,
        message,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "요청 실패");

    setDone(true);
    setStatus("pending");
    setModalOpen(false);
    router.refresh();
  };

  return (
    <>
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
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

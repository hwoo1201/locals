"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UserType } from "@/types";

const STORAGE_KEY = "welcome_banner_dismissed";

interface Props {
  name: string;
  userType: UserType;
  hasProfile: boolean;
}

export default function WelcomeBanner({ name, userType, hasProfile }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const isOwner = userType === "owner";

  const registerHref = isOwner ? "/shop/register" : "/student-profile/register";
  const registerLabel = isOwner ? "매장 등록하기" : "프로필 등록하기";
  const exploreHref = isOwner ? "/explore/students" : "/explore/shops";
  const exploreLabel = isOwner ? "마케터 탐색하기" : "사업 탐색하기";

  return (
    <div className="bg-[#E8EDE6] border-b border-[#D6A77A]/40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-[#1A1A14]">
            {name}님, 환영합니다!
          </span>
          {!hasProfile ? (
            <span className="text-sm text-[#5A5A4E]">
              {isOwner
                ? "매장을 등록하면 마케터를 탐색할 수 있어요."
                : "프로필을 등록해야 사업주에게 발견될 수 있어요."}
            </span>
          ) : (
            <span className="text-sm text-[#5A5A4E]">오늘도 좋은 매칭이 있길 바랍니다.</span>
          )}
          <Link
            href={hasProfile ? exploreHref : registerHref}
            className="text-xs font-bold text-[#4A7C59] bg-[#4A7C59]/10 hover:bg-[#4A7C59]/20 px-3 py-1 rounded-full transition-colors"
          >
            {hasProfile ? exploreLabel : registerLabel}
          </Link>
        </div>
        <button onClick={dismiss} aria-label="닫기" className="text-[#8A8A7E] hover:text-[#5A5A4E] transition-colors text-xl leading-none flex-shrink-0">
          ×
        </button>
      </div>
    </div>
  );
}

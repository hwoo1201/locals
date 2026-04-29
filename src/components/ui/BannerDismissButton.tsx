"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "welcome_banner_dismissed";

export function useBannerVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);
  return visible;
}

export default function BannerDismissButton({ onDismiss }: { onDismiss?: () => void }) {
  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    onDismiss?.();
  };
  return (
    <button onClick={dismiss} aria-label="닫기" className="text-[#8A8A7E] hover:text-[#5A5A4E] transition-colors text-lg leading-none">
      ×
    </button>
  );
}

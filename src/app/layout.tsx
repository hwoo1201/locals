import type { Metadata } from "next";
import "./globals.css";
import GNB from "@/components/layout/GNB";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "솜씨 - 소상공인 × 대학생 마케팅 매칭",
    template: "%s | 솜씨",
  },
  description: "로컬 소상공인과 마케팅 대학생을 연결하는 매칭 플랫폼. 저렴한 비용으로 SNS 마케팅을, 대학생은 실전 포트폴리오를 얻습니다.",
  openGraph: {
    title: "솜씨 - 소상공인 × 대학생 마케팅 매칭",
    description: "로컬 소상공인과 마케팅 대학생을 연결하는 매칭 플랫폼.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <GNB />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

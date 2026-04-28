import type { Metadata } from "next";
import "./globals.css";
import GNB from "@/components/layout/GNB";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/Providers";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.URL),
  title: {
    default: `${BRAND.NAME_KO} - ${BRAND.TAGLINE}`,
    template: `%s | ${BRAND.NAME_KO}`,
  },
  description: BRAND.DESCRIPTION,
  openGraph: {
    title: `${BRAND.NAME_KO} - ${BRAND.TAGLINE}`,
    description: BRAND.DESCRIPTION,
    url: BRAND.URL,
    siteName: BRAND.NAME_KO,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.NAME_KO} - ${BRAND.TAGLINE}`,
    description: BRAND.DESCRIPTION,
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

// app/layout.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "월스타일 — 부천도배학원, 아파트 원룸 도배시공",
  description: "아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요",
  alternates: { canonical: "https://bloger.it.kr" },
  openGraph: {
    title: "월스타일 — 부천도배학원, 아파트 원룸 도배시공",
    description: "아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요",
    url: "https://bloger.it.kr",
    siteName: "월스타일",
    type: "website",
    images: [
      {
        url: "https://bloger.it.kr/apt-dobae-begin.jpg",
        width: 1200,
        height: 630,
        alt: "아파트 도배 시공 사진",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "월스타일 — 부천도배학원, 아파트 원룸 도배시공",
    description: "아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요",
    images: ["https://bloger.it.kr/apt-dobae-begin.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* NAVER 사이트 인증 */}
        <meta name="naver-site-verification" content="add97859f531afd0afdfcfc40acabee95a992355" />
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        {/* 애드센스 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6301363393958519"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
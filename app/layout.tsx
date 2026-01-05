import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="ko">
      <head>
        {/* 기본 SEO */}
        <title>아파트 LH 원룸 도배시공 — 월스타일</title>
        <meta
          name="description"
          content="아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요"
        />

        {/* Open Graph */}
        <meta property="og:title" content="아파트 LH 원룸 도배시공 — 월스타일" />
        <meta property="og:description" content="아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bloger.it.kr" />
        <meta property="og:site_name" content="월스타일" />
        <meta property="og:image" content="https://bloger.it.kr/apt-dobae-begin.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="아파트 도배 시공 사진" />

        <meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="아파트 LH 원룸 도배시공 — 월스타일"/>
<meta name="twitter:description" content="아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요"/>
<meta name="twitter:image" content="https://bloger.it.kr/apt-dobae-begin.jpg"/>



        {/* 네이버 사이트 인증 */}
     <meta name="naver-site-verification" content="add97859f531afd0afdfcfc40acabee95a992355" />

        {/* Canonical */}
        <link rel="canonical" href="https://bloger.it.kr" />

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
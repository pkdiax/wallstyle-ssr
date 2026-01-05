{/** blog-hugi/[slug]/page **/}

import { notFound } from "next/navigation";
import BlogHugiClient, { Post } from "@/app/CLIENT/Blog-Junche";
import {
  fetchSingleimageFromFirebase,
  fetchMultimageFromFirebase,
} from "@/lib/blog-hugi";
import Script from "next/script";

interface PageProps {
  params: { slug: string };
}

/* ------------------------------------------------
   정적 경로 생성
------------------------------------------------ */
export async function generateStaticParams() {
  const singleRaw = await fetchSingleimageFromFirebase();
  const multiRaw = await fetchMultimageFromFirebase();

  const allPosts = [
    ...Object.entries(singleRaw).map(([key, p]: any) => ({
      slug: p.slug ?? key,
    })),
    ...Object.entries(multiRaw).map(([key, p]: any) => ({
      slug: p.slug ?? key,
    })),
  ];

  return allPosts.map(post => ({ slug: post.slug }));
}

/* ------------------------------------------------
   ✅ OG / Twitter / Meta 자동 세팅
------------------------------------------------ */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  const singleRaw = await fetchSingleimageFromFirebase();
  const multiRaw = await fetchMultimageFromFirebase();

  const allPosts: Post[] = [
    ...Object.entries(singleRaw).map(([key, p]: any) => ({
      id: p.id || key,
      slug: p.slug ?? key,
      title: p.title || "",
      summary: p.summary,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
      ogUrl: p.ogUrl ?? p.thumbnailUrl,
      group: p.group,
      step: p.step,
      date: p.date,
    })),
    ...Object.entries(multiRaw).map(([key, p]: any) => ({
      id: p.id || key,
      slug: p.slug ?? key,
      title: p.title || "",
      summary: p.summary,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
      ogUrl: p.ogUrl ?? p.thumbnailUrl,
      group: p.group,
      step: p.step,
      date: p.date,
    })),
  ];

  const post = allPosts.find(p => p.slug === slug);
  if (!post) return {};

  const title =
    post.title || "아파트 도배시공 – 따뜻하고 아늑한 집 만드는 과정";

  const description =
    post.summary ||
    "아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요";

  const image = post.thumbnailUrl
    ? `${post.thumbnailUrl}?w=1200&h=630`
    : "/default-og-1200x630.jpg";

  const url = `https://bloger.it.kr/Blog-Hugi/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },

    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "월스타일",
      locale: "ko_KR",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },

    robots: {
      index: true,
      follow: true,
      maxImagePreview: "large",
    },
  };
}

/* ------------------------------------------------
   실제 페이지 렌더링
------------------------------------------------ */
export default async function BlogHugiPostSSR({ params }: PageProps) {
  const { slug } = params;

  const singleRaw = await fetchSingleimageFromFirebase();
  const multiRaw = await fetchMultimageFromFirebase();

  const allPosts: Post[] = [
    ...Object.entries(singleRaw).map(([key, p]: any) => ({
      id: p.id || key,
      slug: p.slug ?? key,
      title: p.title || "",
      summary: p.summary,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
      ogUrl: p.ogUrl ?? p.thumbnailUrl,
      group: p.group,
      step: p.step,
      date: p.date,
    })),
    ...Object.entries(multiRaw).map(([key, p]: any) => ({
      id: p.id || key,
      slug: p.slug ?? key,
      title: p.title || "",
      summary: p.summary,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
      ogUrl: p.ogUrl ?? p.thumbnailUrl,
      group: p.group,
      step: p.step,
      date: p.date,
    })),
  ];

  const post = allPosts.find(p => p.slug === slug);
  if (!post) return notFound();

  const bottomPosts = allPosts.filter(p => p.slug !== slug).slice(0, 5);

  const postUrl = `https://bloger.it.kr/Blog-Hugi/${slug}`;
  const ogImage = post.thumbnailUrl
    ? `${post.thumbnailUrl}?w=1200&h=630`
    : "/default-og-1200x630.jpg";

  return (
    <>
      {/* JSON-LD (구조화 데이터) */}
      <Script id="json-ld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline:
            post.title?.trim() !== ""
              ? post.title
              : "아파트 도배시공 – 따뜻하고 아늑한 집 만드는 과정",
          description:
            post.summary ||
            "아파트·원룸·빌라 도배, LH도배 장판 시공으로 빠르고 깔끔하게 이렇게 해보았어요",
          image: [encodeURI(ogImage)],
          author: { "@type": "Organization", name: "월 스타일" },
          datePublished: post.date || new Date().toISOString(),
          mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
        })}
      </Script>

      <BlogHugiClient
        singleimage={[]}
        multimage={allPosts}
        initialPost={post}
        bottomPosts={bottomPosts}
      />
    </>
  );
}
import BlogHugiClient, { Post } from "@/app/CLIENT/Blog-Junche";
import { fetchSingleimageFromFirebase, fetchMultimageFromFirebase } from "@/lib/blog-hugi";

export default async function Home() {
  const singleRaw = await fetchSingleimageFromFirebase();
  const multiRaw = await fetchMultimageFromFirebase();

  const singlePosts: Post[] = Object.entries(singleRaw).map(([key, p]: any) => ({
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
  }));

  const multiPosts: Post[] = Object.entries(multiRaw).map(([key, p]: any) => ({
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
  }));

  // ⭐⭐⭐ 여기!
  // step === 1 인 multi 글만 “전부”
 

  // single 은 그대로 필요하면 3개만
  const latestSingle = singlePosts.slice(0, 3);

  return (
    <div className="container mx-auto py-6">
      <BlogHugiClient
        multimage={multiPosts}    // 👉 step1 전체
        singleimage={latestSingle}  // 👉 single 최신 3개
        initialPost={null}
        bottomPosts={[]}
        sidebarExtra={[]}
      />
    </div>
  );
}
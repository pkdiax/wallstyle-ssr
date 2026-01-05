import BlogHugiClient, { Post as ClientPost } from "@/app/CLIENT/Blog-Junche";
import { fetchSingleimageFromFirebase, fetchMultimageFromFirebase } from "@/lib/blog-hugi";

export default async function BlogHugiPageSSR() {
  // ----------------------------
  // 1️⃣ 싱글 이미지 가져오기
  // ----------------------------
  const singleRaw = await fetchSingleimageFromFirebase();
  const singlePosts: ClientPost[] = Object.entries(singleRaw).map(([key, p]: any) => ({
    id: p.id || key,
    title: p.title || "",
    summary: p.summary,
    content: p.content,
    thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
    ogUrl: p.ogUrl ?? p.thumbnailUrl,
    group: p.group,
    step: p.step,
    date: p.date,
  }));

  // ----------------------------
  // 2️⃣ 멀티 이미지 가져오기
  // ----------------------------
  const multiRaw = await fetchMultimageFromFirebase();
  const multiPosts: ClientPost[] = Object.entries(multiRaw).map(([key, p]: any) => ({
    id: p.id || key,
    title: p.title || "",
    summary: p.summary,
    content: p.content,
    thumbnailUrl: p.thumbnailUrl ?? p.ogUrl,
    ogUrl: p.ogUrl ?? p.thumbnailUrl,
    group: p.group,
    step: p.step,
    date: p.date,
  }));

  // ----------------------------
  // 3️⃣ 멀티 그룹 정렬 (Step 순)
  // ----------------------------
  const multimageSorted = Object.values(
    multiPosts.reduce<Record<string, ClientPost[]>>((acc, p) => {
      if (!p.group) return acc;
      if (!acc[p.group]) acc[p.group] = [];
      acc[p.group].push(p);
      return acc;
    }, {})
  )
    .map(group => group.sort((a, b) => Number(a.step ?? 0) - Number(b.step ?? 0)))
    .flat();

  // ----------------------------
  // 4️⃣ 초기 본문 선택
  // ----------------------------
  const initialPost =
    multimageSorted.find(p => Number(p.step) === 1) ||
    multimageSorted[0] ||
    singlePosts[0] ||
    null;

  // ----------------------------
  // 5️⃣ bottomPosts 구성
  // ----------------------------
  const bottomPosts = [
    ...multimageSorted.filter(p => Number(p.step) === 1).slice(0, 5),
    ...singlePosts.slice(0, 5),
  ];

  // ----------------------------
  // 6️⃣ SSR 렌더링
  // ----------------------------
  return (
    <BlogHugiClient
      singleimage={singlePosts}
      multimage={multimageSorted}
      initialPost={initialPost}
      bottomPosts={bottomPosts}
    />
  );
}



// app/AboutPage/page.tsx
import BlogHugiClient from "@/app/CLIENT/Blog-Junche";
import { fetchAllAboutPosts } from "@/lib/about";

export default async function AboutPage() {
  // 회사소개 전체 목록
  const aboutPosts = await fetchAllAboutPosts();

  // 기본으로 보여줄 첫 글
  const initialPost = aboutPosts[0] ?? null;

  return (
    <BlogHugiClient
      multimage={[]}          // 사용 X
      singleimage={[]}        // 사용 X
      initialPost={initialPost}
   //   sidebarExtra={aboutPosts}   // 👉 오른쪽 사이드 목록
    />
  );
}


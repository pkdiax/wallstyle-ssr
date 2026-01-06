
"use client"
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export interface Post {
  id: string;
  title: string;
  slug?: string;
  step?: number;
  date?: string;
  summary?: string;
  content?: string;
  ogUrl?: string;
  imageUrl?: string;
  group?: string;
}

/**
 * URL-safe slug 생성
 */
export function makeSlug(post: Post) {
  if (post.slug) return encodeURIComponent(post.slug);
  // 기본: id를 이용해 영문+숫자 조합으로 변환
  return `post-${post.id}`;
}

/**
 * 전체 게시글 가져오기
 */
export async function getAllPosts(): Promise<Post[]> {
  const postsSnap = await get(ref(db, "posts"));
  const multimageSnap = await get(ref(db, "multimage"));

  const posts: Post[] = postsSnap.exists()
    ? Object.entries<any>(postsSnap.val()).map(([id, p]) => ({ id, ...p }))
    : [];

  const multimage: Post[] = multimageSnap.exists()
    ? Object.entries<any>(multimageSnap.val()).map(([id, p]) => ({ id, ...p }))
    : [];

  return [...posts, ...multimage];
}

/**
 * ID 또는 slug로 게시글 가져오기
 */
export async function getPostById(slugOrId: string): Promise<Post | null> {
  const allPosts = await getAllPosts();
  return (
    allPosts.find(p => makeSlug(p) === slugOrId || p.id === slugOrId) || null
  );
}
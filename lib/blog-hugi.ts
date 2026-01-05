




// lib/blog-hugi.ts
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export interface Post {
  id?: string;
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  step?: number;
  group: string;
  thumbnailUrl?: string;
  ogUrl?: string;
  jpgPath?: string;
  webpPath?: string;
   imageUrl?: string;   // ← 여기 추가
  date?: string;       // ← 필요하면
}

// posts DB fetch
export async function fetchSingleimageFromFirebase(): Promise<Post[]> {
  const snapshot = await get(ref(db, "singleimage"));
  const data = snapshot.val() || {};
  return Object.entries(data).map(([key, p]: [string, any]) => ({
    id: key,
    slug: p.slug ?? key,
    title: p.title ?? "",
    summary: p.summary ?? "",
    content: p.content ?? "",
    step: p.step ?? 0,
    group: p.group ?? "",
    thumbnailUrl: p.thumbnailUrl ?? "",
    ogUrl: p.ogUrl ?? "",
    jpgPath: p.imageJpgPath ?? "",
    webpPath: p.storagePath ?? "",
  }));
}

// multimage DB fetch
export async function fetchMultimageFromFirebase(): Promise<Post[]> {
  const snapshot = await get(ref(db, "multimage"));
  const data = snapshot.val() || {};
  return Object.entries(data).map(([key, p]: [string, any]) => ({
    id: key,
    slug: p.slug ?? key,
    title: p.title ?? "",
    summary: p.summary ?? "",
    content: p.content ?? "",
    step: p.step ?? 0,
    group: p.group ?? "",
    thumbnailUrl: p.thumbnailUrl ?? p.imageUrl ?? "",
    ogUrl: p.ogUrl ?? p.imageJpgUrl ?? "",
    jpgPath: p.imageJpgPath ?? "",
    webpPath: p.storagePath ?? "",
  }));
}

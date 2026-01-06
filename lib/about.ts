"use client"
import { db, storage } from "@/lib/firebase";
import { ref, set, get, update, remove, child } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export interface AboutPost {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  date?: string;
  thumbnailUrl?: string;
  ogUrl?: string;
  jpgPath?: string;
  webpPath?: string;
}

// ---------------- 이미지 업로드 ----------------
export async function uploadAboutImage(file: File) {
  if (!file) throw new Error("파일 없음");

  const filename = `admin-${Date.now()}-${file.name}`;
  const jpgRef = storageRef(storage, `multimage/${filename}`);
  await uploadBytes(jpgRef, file);
  const jpgUrl = await getDownloadURL(jpgRef);

  // 간단하게 jpgUrl -> webpUrl로 치환 (실제 변환 필요 시 따로 구현)
  const webpUrl = jpgUrl.replace(/\.[^/.]+$/, ".webp");

  return { jpgUrl, webpUrl, filename };
}

// ---------------- CRUD ----------------
export async function saveAboutPost(post: AboutPost) {
  await set(ref(db, `about/${post.slug}`), post);
}

export async function fetchAboutPost(slug: string) {
  const snap = await get(child(ref(db), `about/${slug}`));
  return snap.exists() ? (snap.val() as AboutPost) : null;
}

export async function updateAboutPost(slug: string, data: Partial<AboutPost>) {
  await update(ref(db, `about/${slug}`), data);
}

export async function deleteAboutPost(slug: string) {
  await remove(ref(db, `about/${slug}`));
}

export async function fetchAllAboutPosts() {
  const snap = await get(ref(db, "about"));
  if (!snap.exists()) return [];
  const obj = snap.val() as Record<string, AboutPost>;
  return Object.values(obj).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
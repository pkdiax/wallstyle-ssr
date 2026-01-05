"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  saveAboutPost,
  updateAboutPost,
  deleteAboutPost,
  uploadAboutImage,
  fetchAllAboutPosts,
  AboutPost,
} from "@/lib/about";

export default function AboutSave() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [about, setAbout] = useState<AboutPost | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [ogUrl, setOgUrl] = useState<string>("");

  const [allPosts, setAllPosts] = useState<AboutPost[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email === "pkdiax@gmail.com") setIsAdmin(true);
      else router.push("/");
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadAllPosts = async () => {
    const posts = await fetchAllAboutPosts();
    setAllPosts(posts);
  };

  useEffect(() => {
    if (isAdmin) loadAllPosts();
  }, [isAdmin]);

  // === 1200 x 630 자동 리사이즈 ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const original = e.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(original);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const targetW = 1200;
      const targetH = 630;

      canvas.width = targetW;
      canvas.height = targetH;

      const scale = Math.max(targetW / img.width, targetH / img.height);
      const x = (targetW - img.width * scale) / 2;
      const y = (targetH - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const resizedFile = new File([blob], original.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          setFile(resizedFile);
        },
        "image/jpeg",
        0.9
      );
    };
  };

  const generateSlug = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `admin-${y}${m}${d}-${hh}${mm}${ss}`;
  };

  const clearForm = () => {
    setAbout(null);
    setTitle("");
    setSummary("");
    setContent("");
    setFile(null);
    setThumbnailUrl("");
    setOgUrl("");
  };

  const handleSave = async () => {
    const finalSlug = about ? about.slug : generateSlug();

    let jpgUrl = thumbnailUrl;
    let webpUrl = ogUrl;

    if (file) {
      const uploaded = await uploadAboutImage(file);
      jpgUrl = uploaded.jpgUrl;
      webpUrl = uploaded.webpUrl;
      setThumbnailUrl(jpgUrl);
      setOgUrl(webpUrl);
    }

    const post: AboutPost = {
      id: finalSlug,
      slug: finalSlug,
      title,
      summary,
      content,
      date: new Date().toISOString(),
      thumbnailUrl: jpgUrl,
      ogUrl: webpUrl,
    };

    await saveAboutPost(post);
    alert("저장 완료");
    setAbout(post);
    loadAllPosts();
  };

  const handleUpdate = async () => {
    if (!about) return alert("수정할 글 선택 필요");

    let jpgUrl = thumbnailUrl;
    let webpUrl = ogUrl;

    if (file) {
      const uploaded = await uploadAboutImage(file);
      jpgUrl = uploaded.jpgUrl;
      webpUrl = uploaded.webpUrl;
      setThumbnailUrl(jpgUrl);
      setOgUrl(webpUrl);
    }

    await updateAboutPost(about.slug, {
      title,
      summary,
      content,
      thumbnailUrl: jpgUrl,
      ogUrl: webpUrl,
    });

    alert("수정 완료");
    setAbout({
      ...about,
      title,
      summary,
      content,
      thumbnailUrl: jpgUrl,
      ogUrl: webpUrl,
    });
    loadAllPosts();
  };

  const handleDelete = async () => {
    if (!about) return alert("삭제할 글 선택 필요");
    await deleteAboutPost(about.slug);
    alert("삭제 완료");
    clearForm();
    loadAllPosts();
  };

  const handleSelectPost = (post: AboutPost) => {
    setAbout(post);
    setTitle(post.title);
    setSummary(post.summary || "");
    setContent(post.content || "");
    setThumbnailUrl(post.thumbnailUrl || "");
    setOgUrl(post.ogUrl || "");
    setFile(null);
  };

  if (checking) return <p>로그인 상태 확인 중...</p>;
  if (!isAdmin) return <p>권한 없음</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto text-black border rounded shadow space-y-4">
      <h2 className="text-2xl font-bold mb-2">회사 소개 관리 (관리자 전용)</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="border p-2 w-full"
      />

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="요약"
        className="border p-2 w-full h-20"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        className="border p-2 w-full h-40"
      />

      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* 미리보기 — 1200x630 비율 */}
        {file && (
          <div className="mt-3 w-full max-w-xl aspect-[1200/630] rounded overflow-hidden border">
            <img
              src={URL.createObjectURL(file)}
              className="w-full h-full object-cover"
              alt="선택 이미지"
            />
          </div>
        )}

        {!file && thumbnailUrl && (
          <div className="mt-3 w-full max-w-xl aspect-[1200/630] rounded overflow-hidden border">
            <img
              src={thumbnailUrl}
              className="w-full h-full object-cover"
              alt="기존 이미지"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          저장
        </button>
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          삭제
        </button>
      </div>

      <h3 className="text-xl font-bold mt-6">전체 글 목록</h3>

      <div className="border rounded p-2 max-h-96 overflow-y-auto space-y-2">
        {allPosts.length === 0 && <p>등록된 글이 없습니다.</p>}

        {allPosts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-2 border-b pb-1 cursor-pointer hover:bg-gray-100"
            onClick={() => handleSelectPost(post)}
          >
            {post.thumbnailUrl && (
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-16 h-16 object-cover rounded"
              />
            )}

            <div className="flex-1">
              <div className="font-semibold">{post.title}</div>
              <div className="text-sm text-gray-600">{post.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
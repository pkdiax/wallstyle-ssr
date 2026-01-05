"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { db, storage, auth } from "@/lib/firebase";
import {
  ref as dbRef,
  
  
  set,
  onValue,
  remove,
  update,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface Post {
  id?: string;
  slug: string;           // ⭐ slug 필드 추가
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  ogUrl: string;
  webpPath?: string;
  jpgPath?: string;
  date: string;
  author: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function PostManagerGallery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleSummary, setSingleSummary] = useState("");
  const [singleContent, setSingleContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const ADMIN_EMAIL = "pkdiax@gmail.com";

  /** 🔗 Kakao SDK 로드 */
  useEffect(() => {
    if (window.Kakao) return;

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.async = true;
    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init("YOUR_KAKAO_JAVASCRIPT_KEY"); // ← 실제 키로 교체
      }
    };
    document.body.appendChild(script);
  }, []);

  /** 📥 게시글 실시간 로드 */
  useEffect(() => {
    const postsRef = dbRef(db, "singleimage");
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .reverse();
        setPosts(loaded as Post[]);
      } else setPosts([]);
    });
  }, []);

// 🔹 WebP 또는 JPEG 변환 후 업로드
/** 📤 이미지 업로드(WebP + JPEG, 16:9 + 라운드 처리) */
const uploadImageDual = async (file: File) => {
  return new Promise<{
    webp: { url: string; path: string };
    jpg: { url: string; path: string };
  }>(async (resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const width = 1200;
      const height = 630;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context error");

      canvas.width = width;
      canvas.height = height;

      // ✨ 라운드 마스크 제거 — 그냥 전체에 그리기
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dotIndex = file.name.lastIndexOf(".");
      const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;

      // WebP
      const webpBlob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/webp", 0.9)
      );
      if (!webpBlob) return reject("WebP Blob 생성 실패");
      const webpPath = `multimage/${Date.now()}-${baseName}.webp`;
      const webpRef = storageRef(storage, webpPath);
      await uploadBytes(webpRef, webpBlob);
      const webpUrl = await getDownloadURL(webpRef);

      // JPG
      const jpgBlob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/jpeg", 0.9)
      );
      if (!jpgBlob) return reject("JPEG Blob 생성 실패");
      const jpgPath = `multimage/${Date.now()}-${baseName}.jpg`;
      const jpgRef = storageRef(storage, jpgPath);
      await uploadBytes(jpgRef, jpgBlob);
      const jpgUrl = await getDownloadURL(jpgRef);

      resolve({
        webp: { url: webpUrl, path: webpPath },
        jpg: { url: jpgUrl, path: jpgPath },
      });
    };

    img.onerror = (e) => reject(e);
  });
};




const resetForm = () => {
  setSingleTitle("");
  setSingleSummary("");
  setSingleContent("");
  setThumbnailFile(undefined);
  setThumbnailUrl(null);
  setEditingId(null);
  // WebP/JPEG URL 초기화
 
};

/** 💾 저장 / 수정 */
const handleSavePost = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("관리자만 가능합니다.");
    return;
  }

  setLoading(true);

  try {
    // 편집 중인 게시글 찾기
    const editingPost = editingId ? posts.find((p) => p.id === editingId) : null;

    // 기본 이미지 정보
    let uploadedUrl = thumbnailUrl || "";
    let uploadedWebpPath = editingPost?.webpPath || "";
    let uploadedJpgPath = editingPost?.jpgPath || "";

    // 새 이미지 파일이 있을 경우
    if (thumbnailFile) {
      // 기존 파일 삭제
      if (editingPost?.webpPath) await deleteObject(storageRef(storage, editingPost.webpPath!));
      if (editingPost?.jpgPath) await deleteObject(storageRef(storage, editingPost.jpgPath!));

      // 새 이미지 업로드
      const uploaded = await uploadImageDual(thumbnailFile);
      uploadedUrl = uploaded.webp.url;
      uploadedWebpPath = uploaded.webp.path;
      uploadedJpgPath = uploaded.jpg.path;
    }

    // YYYYMMDD 포맷 함수
    const formatDate = (date = new Date()) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}${m}${d}`;
    };

    // DB에 저장할 데이터 구성
    const data = {
      title: singleTitle,
      summary: singleSummary,
      content: singleContent,
      thumbnailUrl: uploadedUrl,
      ogUrl: uploadedUrl,
      webpPath: uploadedWebpPath,
      jpgPath: uploadedJpgPath,
      date: editingPost?.date || new Date().toISOString(),
      author: editingPost?.author || user.email,
    };

    /** ✏ 수정 모드 */
    if (editingId) {
      await update(dbRef(db, `singleimage/${editingId}`), {
        ...data,
        slug: editingId, // 수정 시 기존 slug 유지
      });
      alert("게시글 수정 완료!");
    } 
    /** ➕ 새 글 저장 */
    else {
      // postId 생성: 제목-YYYYMMDD-밀리초 (특수문자 제거)
      let postId = singleTitle.trim()
        ? `${singleTitle.trim()}-${formatDate()}-${Date.now()}`.replace(/[.#$/[\]]/g, "-")
        : `post-${formatDate()}-${Date.now()}`;

      await set(dbRef(db, `singleimage/${postId}`), {
        ...data,
        slug: postId, // 새 글은 고유 slug 생성
      });
      alert("게시글 저장 완료!");
    }

    // 폼 초기화
    resetForm();
  } catch (err) {
    console.error(err);
    alert("저장 중 오류 발생");
  }

  setLoading(false);
};
/** ✏ 수정 */
const handleEditPost = (post: Post) => {
  setSingleTitle(post.title);
  setSingleSummary(post.summary);
  setSingleContent(post.content);
  setThumbnailUrl(post.thumbnailUrl);
  setEditingId(post.id || null);
};

const handleDeletePost = async (id: string) => {
  if (!confirm("정말 삭제하시겠습니까?")) return;

  try {
    const target = posts.find((p) => p.id === id);
    if (target) {
      // WebP, JPEG 모두 삭제
      if (target.webpPath) {
        try { await deleteObject(storageRef(storage, target.webpPath)); } catch {}
      }
      if (target.jpgPath) {
        try { await deleteObject(storageRef(storage, target.jpgPath)); } catch {}
      }
    }

    await remove(dbRef(db, `singleimage/${id}`));
    alert("삭제 완료!");
  } catch (err) {
    console.error(err);
    alert("삭제 중 오류 발생");
  }
};
  const openModal = (i: number) => setModalIndex(i);
  const closeModal = () => setModalIndex(null);
  const prevPost = () =>
    modalIndex !== null && modalIndex > 0 && setModalIndex(modalIndex - 1);
  const nextPost = () =>
    modalIndex !== null &&
    modalIndex < posts.length - 1 &&
    setModalIndex(modalIndex + 1);

  const currentPost =
    modalIndex !== null ? posts[modalIndex] : null;




  return (
    <div className="p-4 max-w-6xl mx-auto">

      {/* 🔥 모달 열릴 때 OG 메타 자동 */}
      {currentPost && (
        <Head>
          <title>{currentPost.title}</title>

          <meta property="og:title" content={currentPost.title} />
          <meta property="og:description" content={currentPost.summary} />
          <meta property="og:image" content={currentPost.ogUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:site_name" content="Wallstyle" />

          {/* 트위터 카드 */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={currentPost.title} />
          <meta name="twitter:description" content={currentPost.summary} />
          <meta name="twitter:image" content={currentPost.ogUrl} />
        </Head>
      )}

      {/* 작성 폼 */}
      <div className="mb-8 p-4 border rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "게시글 수정" : "단일 게시글 작성"}
        </h2>

        <input
          type="text"
          placeholder="제목"
          value={singleTitle}
          onChange={(e) => setSingleTitle(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="요약"
          value={singleSummary}
          onChange={(e) => setSingleSummary(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />

        <textarea
          placeholder="내용"
          value={singleContent}
          onChange={(e) => setSingleContent(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
          rows={5}
        />

        <label className="block mb-2">
          이미지 (썸네일/OG 자동 — 1200×630 권장):
          <input
            type="file"
            onChange={(e) => setThumbnailFile(e.target.files?.[0])}
            className="mt-1"
          />
        </label>

        <button
          onClick={handleSavePost}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          disabled={loading}
        >
          {loading ? "저장 중..." : editingId ? "수정 저장" : "저장"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
          >
            취소
          </button>
        )}
      </div>

      {/* 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <div key={post.id} className="p-2 border rounded shadow bg-white">
            <div className="cursor-pointer" onClick={() => openModal(index)}>
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt="썸네일"
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="text-sm text-gray-600">{post.summary}</p>
            </div>

            <div className="mt-2 flex gap-2 justify-end">
              <button
                onClick={() => handleEditPost(post)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                수정
              </button>
              <button
                onClick={() => post.id && handleDeletePost(post.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {modalIndex !== null && posts[modalIndex] && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full relative overflow-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-black font-bold text-lg"
              onClick={closeModal}
            >
              ×
            </button>

            <h3 className="font-bold text-xl mb-2">
              {posts[modalIndex].title}
            </h3>

            <p className="text-gray-700 mb-2">
              {posts[modalIndex].summary}
            </p>

            {posts[modalIndex].ogUrl && (
              <img
                src={posts[modalIndex].ogUrl}
                alt="OG 이미지"
                className="w-full h-auto mb-3 rounded"
              />
            )}

            <div className="whitespace-pre-wrap text-gray-800 mb-4">
              {posts[modalIndex].content}
            </div>

          

            <div className="mt-2 flex justify-between">
              <button
                onClick={prevPost}
                disabled={modalIndex === 0}
                className="bg-gray-300 px-4 py-1 rounded disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={nextPost}
                disabled={modalIndex === posts.length - 1}
                className="bg-gray-300 px-4 py-1 rounded disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
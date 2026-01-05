"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { db, storage, auth } from "@/lib/firebase";
import {
  ref as dbRef,
  set,
  update,
  remove,
  onValue,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/* ----------------- 타입 ------------------ */
interface GroupPost {
  title: string;
  summary: string;
  content: string;
  file?: File;
  open: boolean;
}

interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  thumbnailUrl: string;
  ogUrl: string;
  storagePath: string;
  imageJpgUrl?: string;   // WebP 외 JPEG 필드 추가
  imageJpgPath?: string;
  group: string;
  step: number;
}




// YYYYMMDD 포맷
function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// Firebase 키에서 막히는 특수문자 제거
function safe(text: string) {
  return text.replace(/[.#$/[\]]/g, "-").trim();
}
/* ----------------- 메인 컴포넌트 ------------------ */
export default function PostFormGrouped() {
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([
    { title: "", summary: "", content: "", open: true },
    { title: "", summary: "", content: "", open: false },
    { title: "", summary: "", content: "", open: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Record<string, Post[]>>({});
  const [selected, setSelected] = useState<Post[] | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);

  const ADMIN_EMAIL = "pkdiax@gmail.com";



  // 🔹 스토리지 파일 삭제
  const deleteStorageFile = async (path?: string) => {
    if (!path) return;
    try {
      await deleteObject(storageRef(storage, path));
    } catch (e) {
      console.error("Storage 삭제 실패:", e);
    }
  };

  // 🔹 본문 HTML 변환
  const formatContent = (text: string) => {
    const lines = text.split("\n").map((line) => line.trim());
    return lines
      .map((line) => line.replace(/\.(\s|$)/g, ".<br/>"))
      .map((line) => `<p>${line}</p>`)
      .join("");
  };

  // 🔹 3단계 그룹 게시글 저장
// 🔹 3단계 그룹 게시글 저장
const handleSaveGroup = async () => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) return alert("관리자만 가능합니다.");

  setLoading(true);

  try {
    let groupId = `${safe(groupPosts[0].title)}-${formatDate()}`;
    if (!groupPosts[0].title.trim())
      groupId = `group-${formatDate()}-${Date.now()}`;

    for (let i = 0; i < groupPosts.length; i++) {
      const post = groupPosts[i];

      let image: { webp: { url: string; path: string }, jpg: { url: string; path: string } } | null = null;

      if (post.file) {
        image = await uploadImageDual(post.file);
      }

      const paragraphs = formatContent(post.content);

      // 🔹 postId를 "제목-날짜시간" 형식으로 생성
      const timestamp = Date.now();
      let postId = post.title.trim()
        ? `${safe(post.title)}-${formatDate()}-${timestamp}`
        : `post-${formatDate()}-${timestamp}-${i + 1}`;

      await set(dbRef(db, `etc/${postId}`), {
        title: post.title,
        summary: post.summary,
        content: paragraphs,
        imageUrl: image?.webp.url || "",
        thumbnailUrl: image?.webp.url || "",
        ogUrl: image?.jpg.url || "",
        storagePath: image?.webp.path || "",
        imageJpgUrl: image?.jpg.url || "",
        imageJpgPath: image?.jpg.path || "",
        author: user.email,
        category: "tip",
        slug: postId,
        group: groupId,
        step: i + 1,
        date: new Date().toISOString(),
      });
    }

    alert("3단계 게시글 저장 완료!");
    setGroupPosts([
      { title: "", summary: "", content: "", open: true },
      { title: "", summary: "", content: "", open: false },
      { title: "", summary: "", content: "", open: false },
    ]);
  } catch (err) {
    console.error(err);
    alert("저장 중 오류 발생");
  }

  setLoading(false);
};

  // 🔹 게시글 삭제
  const deletePost = async (postId: string, storagePath: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    try {
      await deleteStorageFile(storagePath);
      await remove(dbRef(db, `etc/${postId}`));
      alert("삭제 완료");
    } catch (e) {
      console.error(e);
      alert("삭제 오류");
    }
  };

  // 🔹 그룹 삭제
  const deleteGroup = async (groupId: string) => {
    if (!confirm("이 그룹의 모든 게시글과 이미지가 삭제됩니다. 진행할까요?")) return;
    try {
      const group = groups[groupId];
      if (!group) return;

      for (const post of group) {
        await deleteStorageFile(post.storagePath);
        await deleteStorageFile(post.imageJpgPath);
        await remove(dbRef(db, `etc/${post.id}`));
      }

      alert("그룹 전체 삭제 완료");
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류 발생");
    }
  };

  // 🔹 이미지 교체
  const updatePostImage = async (
    postId: string,
    oldPathWebp: string,
    oldPathJpg: string,
    newFile: File
  ) => {
    try {
      await deleteStorageFile(oldPathWebp);
      await deleteStorageFile(oldPathJpg);

      const image = await uploadImageDual(newFile);

      await update(dbRef(db, `etc/${postId}`), {
        imageUrl: image.webp.url,
        thumbnailUrl: image.webp.url,
         ogUrl: image.jpg.url, 
        storagePath: image.webp.path,
        imageJpgUrl: image.jpg.url,
        imageJpgPath: image.jpg.path,
      });

      alert("이미지 업데이트 완료");
    } catch (e) {
      console.error(e);
      alert("업데이트 실패");
    }
  };

  // 🔹 수정 저장
  const saveEdit = async () => {
    if (!editing) return;
    try {
      const paragraphs = formatContent(editing.content);

      await update(dbRef(db, `etc/${editing.id}`), {
        title: editing.title,
        summary: editing.summary,
        content: paragraphs,
      });

      alert("수정 완료");
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("수정 실패");
    }
  };














  /* -------- 데이터 실시간 불러오기 -------- */
  useEffect(() => {
    const postsRef = dbRef(db, "etc");

    onValue(postsRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.val();
      const temp: Record<string, Post[]> = {};

      Object.entries<any>(data).forEach(([id, p]) => {
        const post: Post = { id, ...p };

        if (!temp[post.group]) temp[post.group] = [];
        temp[post.group].push(post);
      });

      Object.keys(temp).forEach((g) =>
        temp[g].sort((a, b) => a.step - b.step)
      );

      setGroups(temp);
    });
  }, []);

  const toggleStep = (idx: number) => {
    const newGroup = [...groupPosts];
    newGroup[idx].open = !newGroup[idx].open;
    setGroupPosts(newGroup);
  };

  const seo = selected ? selected[0] : null;

  return (
    <div className="mb-8 p-4 border rounded shadow space-y-8">
      {/* SEO */}
      {seo && (
        <Head>
          <title>{seo.title}</title>
          <meta name="description" content={seo.summary} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.summary} />
          <meta property="og:image" content={seo.ogUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
      )}

      {/* 작성 폼 */}
      <h2 className="text-2xl font-semibold mb-4">3단계 묶음 게시글 작성</h2>

      {groupPosts.map((post, idx) => (
        <div key={idx} className="mb-4 border rounded p-2 relative">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleStep(idx)}
          >
            <h3 className="font-semibold">단계 {idx + 1}</h3>
            <span>{post.open ? "▲ 접기" : "▼ 펼치기"}</span>
          </div>

          {post.open && (
            <div className="mt-2">
              <input
                className="w-full mb-2 p-2 border rounded"
                placeholder="제목"
                value={post.title} 
                onChange={(e) => {
                  const g = [...groupPosts];
                  g[idx].title = e.target.value;
                  setGroupPosts(g);
                }}
              />

              <textarea
                className="w-full mb-2 p-2 border rounded"
                placeholder="요약"
                  rows={4}
                value={post.summary} 
                onChange={(e) => {
                  const g = [...groupPosts];
                  g[idx].summary = e.target.value;
                  setGroupPosts(g);
                }}
              />

              <textarea
                className="w-full mb-2 p-2 border rounded"
                rows={4}
                placeholder="내용"
                value={post.content} 
                onChange={(e) => {
                  const g = [...groupPosts];
                  g[idx].content = e.target.value;
                  setGroupPosts(g);
                }}
              />

              <input
                type="file"
                onChange={(e) => {
                  const g = [...groupPosts];
                  g[idx].file = e.target.files?.[0];
                  setGroupPosts(g);
                }}
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSaveGroup}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        3단계 게시글 저장
      </button>

      {/* 목록 */}
      <h2 className="text-xl font-bold mt-6">저장된 3단계 게시글</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(groups).map(([groupId, group]) => {
          const step1 = group[0];
          if (!step1) return null;

          return (
            <div key={groupId} className="border rounded p-3 shadow relative">
              {auth.currentUser?.email === ADMIN_EMAIL && (
                <button
                  className="absolute top-2 right-2 text-sm text-red-600"
                  onClick={() => deleteGroup(groupId)}
                >
                  전체삭제
                </button>
              )}

              <div
                className="cursor-pointer"
                onClick={() => setSelected(group)}
              >
      <img
  src={step1.thumbnailUrl || "/Wall-Style.jpg"} // 기본 이미지 경로
  className="w-full rounded mb-2"
  style={{ aspectRatio: "16/9", objectFit: "contain" }}
/>

                <h3 className="font-bold">{step1.title}</h3>
                <p className="text-sm text-gray-600">{step1.summary}</p>
              </div>
            </div>
          );
        })}
      </div>
   {/* 모달 / 수정 모달 부분 */}
{selected && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white max-w-4xl w-full p-6 rounded shadow-lg overflow-y-auto max-h-[90vh] relative">
      <button
        className="absolute top-3 right-3 text-red-600"
        onClick={() => setSelected(null)}
      >
        닫기 ✕
      </button>
      <h2 className="text-xl font-bold mb-4">전체 보기</h2>
      {selected.map((post) => (
        <div key={post.id} className="mb-6 border-t pt-4">
          <h3 className="font-bold">
            {post.step}단계 — {post.title}
          </h3>
          <p className="text-gray-600 mb-2">{post.summary}</p>
          <img
            src={post.ogUrl || "/상가도배.jpg"} // 기본 이미지 경로
            className="w-full rounded mb-2"
            style={{
              aspectRatio: "16/9",
              objectFit: "contain",
            }}
          />
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {auth.currentUser?.email === ADMIN_EMAIL && (
            <div className="mt-3 flex gap-4">
              <button
                className="text-blue-600 underline"
                onClick={() => setEditing(post)}
              >
                수정
              </button>
           <label className="cursor-pointer text-blue-600 underline">
  이미지 변경
  <input
    type="file"
    hidden
    onChange={async (e) => {
      if (!e.target.files || !post.id) return;
      const file = e.target.files[0];
      if (!file) return;

      try {
        await updatePostImage(
          post.id,
          post.storagePath || "",
          (post as any).imageJpgPath || "",
          file
        );
      } catch (err) {
        console.error(err);
        alert("이미지 교체 실패");
      }
    }}
  />
</label>
              <button
                className="text-red-600 underline"
                onClick={() =>
                  deletePost(post.id!, post.storagePath || "")
                }
              >
                삭제
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

    {editing && (
  <div className="fixed inset-0 bg-gray-300 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-2xl p-6 rounded shadow relative text-black">
      <h3 className="font-bold mb-4">{editing.step}단계 글 수정</h3>

      <textarea
        className="w-full mb-2 p-2 border rounded text-black"
        value={editing.title}
        onChange={(e) =>
          setEditing({ ...editing, title: e.target.value })
        }
        placeholder="제목"
      />

      <textarea
        className="w-full mb-2 p-2 border rounded text-black"
        value={editing.summary}
        onChange={(e) =>
          setEditing({ ...editing, summary: e.target.value })
        }
        placeholder="요약"
      />

      <textarea
        className="w-full mb-4 p-2 border rounded text-black"
        rows={6}
        value={editing.content}
        onChange={(e) =>
          setEditing({ ...editing, content: e.target.value })
        }
        placeholder="설명"
      />

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 border rounded text-black"
          onClick={() => setEditing(null)}
        >
          취소
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={saveEdit}
        >
          저장
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}





















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
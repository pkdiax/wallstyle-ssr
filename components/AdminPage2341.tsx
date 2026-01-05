"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email === "pkdiax@gmail.com") setIsAdmin(true);
      else router.push("/"); // 일반 사용자 홈으로
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (checking) return <p>로그인 상태 확인 중...</p>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">관리자 게시글 관리</h1>
      <div className="flex gap-4 justify-center">
    <button
  onClick={() => router.push("/AboutSave")}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
         회사이름 이미지 소개말
        </button>
        <button
          onClick={() => router.push("/postformsingle")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          단일 게시글 작성 페이지 이동
        </button>
        <button
          onClick={() => router.push("/postformgrouped")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
         멀티 이미지 글 저장
        </button>

           <button
          onClick={() => router.push("/campany")}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
         회사 전화번호
        </button>
      </div>
    </div>
  );
}
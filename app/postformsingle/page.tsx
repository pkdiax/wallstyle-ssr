"use client";
import PostFormSingle from "@/components/PostFormSingle";

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">단일 게시글 작성</h1>
      <PostFormSingle />
    </div>
  );
}
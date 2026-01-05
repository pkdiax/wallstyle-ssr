"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

interface Post {
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  group?: string;
  step?: number;
   category?: string; // category 추가
}

export default function PostListModal() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalGroup, setModalGroup] = useState<Post[] | null>(null);

  useEffect(() => {
    const postsRef = dbRef(db, "posts");
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allPosts = Object.entries(data).map(([id, post]: any) => ({ id, ...post }));
        setPosts(allPosts.reverse());
      }
    });
  }, []);

  const openModal = (groupId: string) => {
    const groupPosts = posts.filter(p => p.group === groupId).sort((a, b) => (a.step! - b.step!));
    setModalGroup(groupPosts);
  };

  const closeModal = () => setModalGroup(null);

  const step1Posts = posts.filter(p => p.step === 1 && p.category === "tip");

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">팁과 노하우</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {step1Posts.map(post => (
          <div key={post.id} className="border rounded p-4 cursor-pointer" onClick={() => openModal(post.group!)}>
            <h3 className="font-semibold">{post.title}</h3>
            <p>{post.summary}</p>
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover rounded"/>}
          </div>
        ))}
      </div>

      {modalGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-3xl p-6 rounded max-h-[90vh] overflow-y-auto relative">
            <button onClick={closeModal} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">X</button>
            {modalGroup.map(post => (
              <div key={post.id} className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-2">{post.summary}</p>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-60 object-cover rounded mb-2"/>}
                <div dangerouslySetInnerHTML={{ __html: post.content || "" }}/>
                <hr className="my-4"/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

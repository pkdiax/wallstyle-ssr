// /components/SidebarPosts.tsx
"use client";

import Image from "next/image";
import { Post } from "@/app/CLIENT/Type";



interface SidebarPostsProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export default function SidebarPosts({ posts, onSelectPost }: SidebarPostsProps) {
  return (
<div>
  {posts.map(post => (
    <article
      key={post.id}
      style={{ 
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
        cursor: "pointer"
      }}
      onClick={() => onSelectPost(post)}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={post.ogUrl || post.imageUrl || "/default-thumbnail.jpg"}
          alt={post.title}
          width={50}
          height={50}
          style={{ objectFit: "cover" }}
        />
      </div>

      <h3 style={{ fontSize: "14px", fontWeight: 500 }}>
        {post.title}
      </h3>
    </article>
  ))}
</div>
  );
}
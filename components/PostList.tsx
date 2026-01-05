"use client";

interface Post {
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  date?: string;
  category?: string;
  group?: string;
  step?: number;
}

interface PostListProps {
  posts: Post[];
  setModalPost: (post: Post) => void; // 클릭 시 모달 열기 용도
}

export default function PostList({ posts, setModalPost }: PostListProps) {
  if (!posts || posts.length === 0) return <p className="text-center text-gray-500">게시글이 없습니다.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border rounded shadow hover:shadow-lg cursor-pointer overflow-hidden"
          onClick={() => setModalPost(post)}
        >
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-3">
            <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{post.summary}</p>
            <p className="text-gray-400 text-xs">{new Date(post.date || "").toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
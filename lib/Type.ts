// types/Post.ts
export interface Post {
  id: string;               // 각 포스트 고유 ID
  title: string;            // 제목
  ogUrl?: string;           // OG 이미지 URL (선택)
  imageUrl?: string;        // 이미지 URL (선택)
  summary?: string;         // 요약 내용 (선택)
  content?: string;         // 본문 내용 (선택)
  date?: string;            // 작성일 (ISO 문자열, 선택)
  author?: string;          // 작성자 (선택)
  category?: string;        // 카테고리 (선택)
  slug?: string;            // 슬러그 (선택)
  step?: number;            // 단계 (선택)
  group?: string;           // 그룹 (선택)
}
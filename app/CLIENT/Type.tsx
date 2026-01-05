



// src/components/Type.ts
export interface Post {
  id: string;
  title: string;
  summary: string;
   content: string;  
  imageUrl?: string;
  ogUrl?: string;
  step?: number;
  group?: string;
  date?: string;
  thumbnailUrl?: string;
   slug?: string; // 🔹 추가
}
  





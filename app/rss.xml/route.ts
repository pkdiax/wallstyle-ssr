// app/api/rss/route.ts
export const dynamic = "force-static";
import { fetchSingleimageFromFirebase, fetchMultimageFromFirebase } from "@/lib/blog-hugi";

// 🔹 XML 안전 처리 (CDATA 밖)
function escapeXml(str?: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 🔹 CDATA용 최소 처리 (CDATA 안에서는 &만 처리)
function escapeCdata(str?: string) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;");
}

export async function GET() {
  const siteUrl = "https://bloger.it.kr";

  const single = await fetchSingleimageFromFirebase();
  const multi = await fetchMultimageFromFirebase();
  const allPosts = [...Object.values(single), ...Object.values(multi)].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <channel>
    <title><![CDATA[아파트 LH 원룸 도배시공 — 월스타일]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[아파트·원룸·빌라 도배, LH도배 장판 시공 사례]]></description>
    <language>ko</language>

    ${allPosts
      .map(post => {
        const slug = encodeURIComponent(post.slug ?? "");
        const postUrl = `${siteUrl}/Blog-Hugi/${slug}`;
        const pubDate = new Date(post.date ?? Date.now()).toUTCString();
        const isoDate = new Date(post.date ?? Date.now()).toISOString();

        const titleCdata = escapeCdata(post.title ?? "");
        const summaryCdata = escapeCdata(post.summary ?? "");
        const imageUrl = escapeXml(post.thumbnailUrl ?? post.ogUrl ?? "");

        return `
      <item>
        <title><![CDATA[${titleCdata}]]></title>
        <link>${postUrl}</link>
        <guid isPermaLink="true">${postUrl}</guid>
        <description><![CDATA[${summaryCdata}]]></description>
        ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ""}
        <pubDate>${pubDate}</pubDate>

        <!-- 뉴스용 메타 -->
        <news:news>
          <news:publication>
            <news:name>월스타일</news:name>
            <news:language>ko</news:language>
          </news:publication>
          <news:publication_date>${isoDate}</news:publication_date>
          <news:title><![CDATA[${titleCdata}]]></news:title>
        </news:news>
      </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
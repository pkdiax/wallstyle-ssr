"use client"
export const dynamic = "force-static";
import { fetchSingleimageFromFirebase, fetchMultimageFromFirebase } from "@/lib/blog-hugi";

export async function GET() {
  const siteUrl = "https://bloger.it.kr";

  const single = await fetchSingleimageFromFirebase();
  const multi = await fetchMultimageFromFirebase();

  const allPosts = [
    ...Object.entries(single).map(([k, p]: any) => ({
      slug: p.slug ?? k,
      date: p.date || new Date().toISOString(),
    })),
    ...Object.entries(multi).map(([k, p]: any) => ({
      slug: p.slug ?? k,
      date: p.date || new Date().toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>

  ${allPosts
    .map(
      (p) => `
  <url>
    <loc>${siteUrl}/Blog-Hugi/${p.slug}</loc>
    <lastmod>${new Date(p.date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
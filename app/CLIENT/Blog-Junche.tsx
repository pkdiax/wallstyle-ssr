"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { fetchAllAboutPosts } from "@/lib/about";
import { db } from "@/lib/firebase"; // Firebase Realtime DB
import { ref, onValue } from "firebase/database";
import React from "react";

import Head from "next/head";
import Script from "next/script";


export interface Post {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  step?: number;
  group?: string;
  thumbnailUrl?: string;
  ogUrl?: string;
  date?: string;
  slug?: string;
}

interface Company {
  id: string;
  companyName: string;
  phoneNumber: string;
}

interface BlogHugiClientProps {
  multimage?: Post[];
  initialPost?: Post | null;
  singleimage?: Post[];
  bottomPosts?: Post[];
  sidebarExtra?: Post[];
  etc?: Post[]; 
}

export default function BlogHugiClient({
  multimage = [],
  initialPost = null,
  singleimage = [],


 
}: BlogHugiClientProps) {
  const [currentGroupPosts, setCurrentGroupPosts] = useState<Post[]>([]);
  const [companyIntro, setCompanyIntro] = useState<Post | null>(null);
  const [singlePosts, setSinglePosts] = useState<Post[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

const [allPosts, setAllPosts] = useState<Post[]>([]);
const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // 🔽 🔽 🔽  ← JSX보다 위에서 선언!
const step1SidebarPosts =
  allPosts
    .filter(p => p.group)
    .sort((a, b) => Number(a.step ?? 0) - Number(b.step ?? 0)) // ⬅️ step 작은 것(=1)이 먼저
    .filter((post, index, self) =>
      index === self.findIndex(p => p.group === post.group)
    );
 

useEffect(() => {
  if (!selectedGroup) return;

  const groupPosts = allPosts
    .filter(p => (p.group ?? "").trim() === selectedGroup.trim())
    .sort((a, b) => Number(a.step ?? 0) - Number(b.step ?? 0));

  setCurrentGroupPosts(groupPosts);
}, [selectedGroup, allPosts]);




useEffect(() => {
  const postsRef = ref(db, "etc");

  const unsubscribe = onValue(postsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const formatted: Post[] = Object.entries(data).map(([key, value]: any) => ({
      id: key,
      title: value.title,
      step: value.step,
      group: value.group,
      thumbnailUrl: value.thumbnailUrl,
      summary: value.summary,
      content: value.content,
      slug: value.slug,
    }));

    setAllPosts(formatted);

    setSelectedGroup(prev =>
      prev || (formatted[0]?.group ?? null)
    );
  });

  return () => unsubscribe();
}, []); //  ← 반드시 그대로! 아무것도 넣지 말기

  // ----------------------------
  // 회사소개 불러오기
  useEffect(() => {
    async function loadAbout() {
      const list = await fetchAllAboutPosts();
      if (list.length > 0) setCompanyIntro(list[0]);
    }
    loadAbout();
  }, []);

  // singleimage 적용
  useEffect(() => {
    setSinglePosts(singleimage ?? []);
  }, [singleimage]);



/*
  // 초기 본문 설정
  useEffect(() => {
    if (initialPost) setCurrentGroupPosts([initialPost]);
    else if (companyIntro) setCurrentGroupPosts([companyIntro]);
  }, [initialPost, companyIntro]);
  */

useEffect(() => {
  if (initialPost) {
    setCurrentGroupPosts([initialPost]);
  } else if (allPosts.length > 0) {
    const firstGroup = allPosts
      .filter(p => p.group === allPosts[0].group)
      .sort((a, b) => Number(a.step ?? 0) - Number(b.step ?? 0));

    setCurrentGroupPosts(firstGroup);
  }
}, [initialPost, allPosts]); // step1SidebarPosts 제거

// Step1~3 그룹 토글용 클릭 이벤트
const handlePostClick = (post: Post) => {
  if (!post) return;

  // Step 1~3 글 필터링
  const stepPosts = multimage.filter(p => [1, 2, 3].includes(Number(p.step ?? 0)));

  // 단일 포스트(step이 없거나 1~3 외의 값) 처리
  const isSinglePost = ![1, 2, 3].includes(Number(post.step ?? 0));

  if (isSinglePost) {
    // 단일 포스트는 클릭하면 그대로 보여줌
    setCurrentGroupPosts([post]);
  } else {
    // 현재 보여지는 글이 이미 Step1~3 전체인지 확인
    const isAllStepShown = currentGroupPosts.every(p => [1,2,3].includes(Number(p.step ?? 0))) &&
                           stepPosts.length === currentGroupPosts.length;

    if (isAllStepShown) {
      // 이미 전체라면 클릭한 글로 포커스만
      setCurrentGroupPosts([post]);
    } else {
      // 전체 Step1~3 글 표시
      if (post.group) {
        // 그룹 글만 필터링
        const groupPosts = stepPosts.filter(p => p.group === post.group);
        setCurrentGroupPosts(groupPosts.length ? groupPosts : [post]);
      } else {
        setCurrentGroupPosts(stepPosts);
      }
    }
  }

  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
};


  const multimageStep1 = multimage.filter(p => Number(p.step ?? 0) === 1);

  // Kakao SDK — 최초 1회만 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Kakao) return;
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      const Kakao = (window as any).Kakao;
      if (Kakao && !Kakao.isInitialized()) {
        Kakao.init("0f9a45d0dd78c7ff1ec351042bd8d7f5");
      }
      console.log("Kakao SDK loaded");
    };
    document.body.appendChild(script);
  }, []);


  // Firebase Realtime DB — companies 실시간 감시
useEffect(() => {
  const companiesRef = ref(db, "companies");

  const unsubscribe = onValue(companiesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const formatted: Company[] = Object.entries(data).map(([key, value]: any) => ({
        id: key,
        companyName: value.companyName,
        phoneNumber: value.phoneNumber,
      }));
      setCompanies(formatted);
    } else {
      setCompanies([]);
    }
  });

  return () => unsubscribe(); // ✅ 이렇게 호출
}, []);


















// 공유 버튼 UI (이모지 포함)
// 공유 버튼 UI (DB 이미지 + content 포함)
const renderShareButtons = () => {
  const getPostUrl = () => (typeof window !== "undefined" ? window.location.href : "");
  const getPostTitle = () => currentGroupPosts[0]?.title ?? "이 글을 공유합니다";

  // content HTML → plain text
  const getPostContentText = () => {
    if (!currentGroupPosts[0]?.content) return currentGroupPosts[0]?.summary ?? "";
    const div = document.createElement("div");
    div.innerHTML = currentGroupPosts[0].content;
    return div.textContent || div.innerText || "";
  };

  const getPostSummary = () =>
    currentGroupPosts[0]?.summary ?? getPostContentText() ?? "포스트 내용을 확인하세요.";

  const getPostImage = () =>
    currentGroupPosts[0]?.thumbnailUrl ||
    "https://developers.kakao.com/assets/img/about/logos/kakaolink40_original.png";
















  // ---------------- Kakao톡 공유 ----------------
  const shareKakao = () => {
    if (typeof window === "undefined") return;
    const Kakao = (window as any).Kakao;
    if (!Kakao) return;

    if (!Kakao.isInitialized()) {
      Kakao.init("91b2cff5312f1597034e94b0ff8a0510");
    }

    try {
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: getPostTitle(),
          description: getPostSummary(),
          imageUrl: getPostImage(),
          link: {
            mobileWebUrl: getPostUrl(),
            webUrl: getPostUrl(),
          },
        },
      });
    } catch (error) {
      console.error("Kakao 공유 오류:", error);
      alert("카카오톡 공유 중 오류가 발생했습니다.");
    }
  };

  // ---------------- 네이버 블로그 공유 ----------------
  const shareNaverBlog = () => {
    const url = encodeURIComponent(getPostUrl());
    const title = encodeURIComponent(getPostTitle());
    const summary = encodeURIComponent(getPostSummary());
    // 네이버 블로그는 OG 태그로 이미지 자동 처리
    window.open(
      `https://share.naver.com/web/shareView.nhn?url=${url}&title=${title}&summary=${summary}`,
      "_blank",
      "width=550,height=550"
    );
  };

  // ---------------- Band 공유 ----------------
  const shareBand = () => {
    const url = encodeURIComponent(getPostUrl());
    const title = encodeURIComponent(getPostTitle());
    const summary = encodeURIComponent(getPostSummary());
    const image = encodeURIComponent(getPostImage());
    window.open(
      `https://band.us/plugin/share?body=${title}%0A${summary}&route=${url}&image=${image}`,
      "_blank",
      "width=550,height=550"
    );
  };

  // ---------------- SMS 공유 ----------------
  const shareSMS = () => {
    const text = encodeURIComponent(
      `${getPostTitle()}\n${getPostSummary()}\n${getPostUrl()}\n이미지: ${getPostImage()}`
    );
    window.location.href = `sms:?body=${text}`;
  };

  return (
    <div className="flex flex-wrap gap-2 mt-6 text-sm">
      <button
        onClick={shareKakao}
        className="px-3 py-1  rounded hover:bg-yellow-400 transition-colors duration-200"
      >
        💛 카카오톡 공유
      </button>
      <button
        onClick={shareNaverBlog}
        className="px-3 py-1  rounded hover:bg-green-400 transition-colors duration-200"
      >
        💚 네이버 블로그 공유
      </button>
      <button
        onClick={shareBand}
        className="px-3 py-1  rounded hover:bg-purple-400 transition-colors duration-200"
      >
        💜 밴드 공유
      </button>
      <button
        onClick={shareSMS}
        className="px-3 py-1  rounded hover:bg-gray-400 transition-colors duration-200"
      >
        📩 SMS 공유
      </button>
    </div>
  );
};























const renderTitleWithLineBreaks = (title: string) =>
  title.split(/([.!?])/).map((part, i) =>
    /[.!?]/.test(part) ? <React.Fragment key={i}>{part}<br /></React.Fragment>
    : <React.Fragment key={i}>{part}</React.Fragment>
  );



  
  return (















<div className="pageWrapper px-4 md:px-6 py-8 max-w-7xl mx-auto box-border">
  <div className="container flex flex-col md:flex-row gap-6 items-start">


{/* 메인 본문 */}
<div className="mainContent  flex-1 min-w-0 space-y-6">

{currentGroupPosts.map((post, index) => (
  <article
    key={post.id}
    className="block border border-gray-600 rounded-xl cursor-pointer bg-transparent hover:bg-gray-900/20 transition-colors duration-200 shadow-md hover:shadow-lg mb-6"
    onClick={() => handlePostClick(post)}
    itemScope
    itemType="https://schema.org/Article"
  >
    {/* 제목 */}
    {index === 0 ? (
      <h1
  className="p-4 font-extrabold text-3xl text-yellow-400 mt-4 w-[98%] mx-auto border-b border-gray-600 rounded-t-xl hover:text-white transition-colors duration-200"
  itemProp="headline"
>
    {renderTitleWithLineBreaks(post.title)}
  </h1>
    ) : post.step === 1 || post.step === 2 ? (
      <h2
        className="p-4 font-extrabold text-3xl text-yellow-400 mt-4 w-[98%] mx-auto border-b border-gray-600 rounded-t-xl hover:text-white transition-colors duration-200"
        itemProp="headline"
      >
       {renderTitleWithLineBreaks(post.title)}
  </h2>
    ) : post.step === 3 ? (
      <h3
         className="p-4 font-extrabold text-3xl text-yellow-400 mt-4 w-[98%] mx-auto border-b border-gray-600 rounded-t-xl hover:text-white transition-colors duration-200"
        itemProp="headline"
      >
      {renderTitleWithLineBreaks(post.title)}
  </h3>
    ) : (
      <h2
       className="p-4 font-extrabold text-3xl text-yellow-400 mt-4 w-[98%] mx-auto border-b border-gray-600 rounded-t-xl hover:text-white transition-colors duration-200"
        itemProp="headline"
      >
       {renderTitleWithLineBreaks(post.title)}
  </h2>
    )}
 
    {/* summary → 문장 단위 줄바꿈 */}
    {post.summary && (
     <h3
  className="border border-yellow-400 rounded-lg p-4 mt-4 mb-6 text-white leading-relaxed space-y-2 font-medium 
             bg-gray-800 bg-opacity-50 
             hover:bg-yellow-500/10 hover:border-yellow-300 hover:text-yellow-300 
             transition-colors duration-300"
  itemProp="description"
>
        {post.summary.split(/([.?!])/g).map((part, i, arr) => {
          if (/[.?!]/.test(part)) return null; // 구분자 스킵
          const nextSep = arr[i + 1] ?? "";
          return (
            <span key={i} className="block mb-1">
              {part.trim() + nextSep}
            </span>
          );
        })}
      </h3>
    )}


     {/* 썸네일 이미지 */}
    {post.thumbnailUrl && (
       <div className="relative   aspect-[16/9] mt-4 mb-4 rounded-lg overflow-hidden shadow-lg">   
        <Image
          src={post.thumbnailUrl}
          alt={`[아파트 도배시공] ${post.title}`}
          fill
          className="object-cover"
          itemProp="image"
          loading="lazy"
        />
      </div>
    )}

    {/* 본문 내용 */}
  {post.content && (
  <div
    className="border border-gray-600 rounded-lg p-4 mt-4 mb-6 text-white leading-relaxed space-y-3 font-medium 
               bg-gray-800 bg-opacity-10 
               hover:bg-gray-900/20 hover:border-yellow-400 
               transition-colors duration-200"
   dangerouslySetInnerHTML={{
    __html: post.content.replace(/([.!?])/g, "$1<br />"),
  }}

    itemProp="articleBody"
  />
)}
  </article>
))} 
  {renderShareButtons()}

</div>

  
        {/* 사이드바 */}
    <div className="w-full md:w-1/4 flex-shrink-0 min-w-0 flex flex-col gap-6">
    {/* Step1 그룹 포스트 사이드바 */}
{step1SidebarPosts.map((post) => {
  const isActive = selectedGroup === post.group;

  return ( 
    <article
      key={post.slug ?? post.id}
    className={`border rounded p-4 shadow cursor-pointer `}
      onClick={() => {
        // 선택된 그룹 업데이트
        setSelectedGroup(post.group ?? null);

        // 선택된 그룹의 Step1~3 글 본문에 표시
        if (post.group) {
          const groupPosts = allPosts
            .filter(p => p.group === post.group && [1, 2, 3].includes(Number(p.step ?? 0)))
            .sort((a, b) => Number(a.step ?? 0) - Number(b.step ?? 0));

          setCurrentGroupPosts(groupPosts);
        }
      }}
      itemScope
      itemType="https://schema.org/Article"
    >
      <h2 className="text-xl font-bold mb-4">월 스타일 소개 </h2>
       <div className="flex items-center gap-3 border-b pb-2 mb-2">
      {post.thumbnailUrl && (
        <div className="w-10 h-10 relative">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover rounded-full" 
            loading="eager" // <- 여기 추가
          />
        </div>
      )}

    <h3 className="text-sm font-semibold no-underline hover:text-base transition-all duration-200">
  {post.title.length > 15 ? post.title.slice(0, 15) + "…" : post.title}
</h3></div>
    </article>
  );
})}



  {companyIntro && (
  <article
    className="border rounded p-4 shadow cursor-pointer"
    onClick={() => handlePostClick(companyIntro)}
  >
    <h2 className="text-xl font-bold mb-4">도배 시공 팁과 노하우 </h2>
    <div className="flex items-center gap-3 border-b pb-2 mb-2">
      {companyIntro.thumbnailUrl ? (
        <div className="w-12 h-12 relative">
          <Image
            src={companyIntro.thumbnailUrl}
            alt={companyIntro.title}
            fill
            className="object-cover rounded-full"
             loading="eager" // <- 여기 추가
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
          없음
        </div>
      )}
      <h3 className="text-sm font-semibold no-underline hover:text-base transition-all duration-200">
        {companyIntro.title.length > 15
          ? companyIntro.title.slice(0, 15) + "..."
          : companyIntro.title}
      </h3>
    </div>
  </article>
)} 
      {/* 지역별 전화번호 */}
      <div className="border rounded p-4 shadow">
      <h2
  className="text-xl font-bold mb-4 
             text-amber-200 
             text-center
             border border-amber-300 
             rounded-2xl 
             px-4 py-2"
>빠른 시공 전화 상담</h2>
      {companies.length > 0 ? (
  companies.map((company) => (
    <article
      key={company.id}
      className="flex justify-between items-center border-b pb-2 mb-2 group"
    >
      {/* 왼쪽: 회사명 */}
      <span className="font-semibold text-sm transition-all duration-200 ">
        {company.companyName}
      </span>

      {/* 오른쪽: 전화번호 */}
      <a
        href={`tel:${company.phoneNumber}`}
        className="font-semibold text-sm font-semibold no-underline hover:text-base transition-all duration-200"
      >
        {company.phoneNumber}
      </a>
    </article>
  ))
) : (
  <div className="text-sm">저장된 전화번호가 없습니다.</div>
)}
      </div>

      {/* 단일 후기 */}
      <div className="border rounded p-4 shadow">
        <h2 className="text-xl font-bold mb-4">도배 시공 후기 / 공지</h2>
        {singlePosts.length > 0 ? (
          singlePosts.map(post => (
            <article
              key={post.id}
              className="flex items-center gap-3 border-b pb-2 mb-2 cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              {post.thumbnailUrl ? (
                <div className="w-12 h-12 relative">
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover rounded-full"
                     loading="eager" // <- 여기 추가
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
                  없음
                </div>
              )}
           <h3 className="text-sm font-semibold no-underline hover:text-base transition-all duration-200">

                 {post.title.length > 15 ? post.title.slice(0, 15) + "…" : post.title}
              </h3>
            </article>
          ))
        ) : (
          <div className="text-sm">단일 후기가 없습니다.</div>
        )}
  
  </div>
 
    </div>
   
  </div>
  {/* Step1 슬라이더 */}
  {multimageStep1.length > 0 && (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">다른 후기 (Step1)</h2>
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={16}
        slidesPerView={3}
        navigation
        autoplay={{ delay: 4000 }}
        loop
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {multimageStep1.map((post) => (
          <SwiperSlide key={post.id}>
       <article
  className="relative block border rounded-xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer"
  onClick={() => handlePostClick(post)}
  itemScope
  itemType="https://schema.org/Article"
>
  {post.thumbnailUrl && (
    <div className="relative w-full h-48 overflow-hidden">
      <Image
        src={post.thumbnailUrl}
        alt={`[LH 도배장판시공] ${post.title}`}
        fill
        className="object-cover"
        itemProp="image"
        loading="eager"
      />
    </div>
  )}

  {/* Step1 슬라이더 제목 */}
  <h3 className="p-3 text-center font-semibold relative z-10 ">
    {post.title.length > 15 ? post.title.slice(0, 15) + "…" : post.title}
  </h3>
</article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )}
</div> 
);
 
}
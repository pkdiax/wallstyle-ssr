// app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* 회사 정보 */}
        <div>
          <h4 className="font-bold mb-2 text-black">월스타일</h4>
          <p className="text-sm text-gray-600">주소: 경기도 부천시 소사로 102번길</p>
          <p className="text-sm text-gray-600">연락처: 032-341-7123 / 0507-1438-7124</p>
          <p className="text-sm text-gray-600">이메일: info@wallstyle.com</p>
        </div>

    {/* 링크 */}
<div className="flex flex-col gap-1">
  <h4 className="font-bold mb-2 text-black">링크</h4>
  <a href="/" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">
    홈
  </a>
  <a href="/Blog-Hugi" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">
    시공 후기
  </a>


  <a href="tel:01046447123" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">
    빠른전화상담: 010-4644-7123
  </a>
</div>

        {/* SNS */}
        <div className="flex flex-col gap-1">
          <h4 className="font-bold mb-2 text-black" >SNS</h4>
          <a href="#" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">인스타그램</a>
          <a href="#" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">페이스북</a>
          <a href="#" className="text-sm text-gray-700 hover:text-blue-500 transition-colors">유튜브</a>
        </div>
      </div>

      <div className="text-center text-gray-500 text-xs py-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} 월스타일.  Email: pkdiax@naver.com --- All rights reserved.
      </div>
    </footer>
  );
}

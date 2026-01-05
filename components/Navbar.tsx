"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import logo from "@/public/wallstyle.png"; // PNG 경로

export default function Navbar({
  onSelectPage,
}: {
  onSelectPage?: (page: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setOpen(false);

      if (result.user.email === "pkdiax@gmail.com") {
        router.push("/admin");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setOpen(false);
  };

  const menuLinks = [
    { href: "/", label: "홈" },

 
    { href: "/Blog-Hugi", label: "시공 후기" },

   
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center relative">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
<div className="relative w-[300px] h-[40px]">
  <Image
    src={logo}
    alt="월스타일 로고"
    fill

  loading="eager"
    style={{ objectFit: "contain" }} // 비율 유지
  />
</div>         
          </Link>


          {/* 햄버거 버튼 */}
          <button
            className="md:hidden border px-2 py-1 rounded text-black"
            onClick={() => setOpen(true)}
          >
            메뉴
          </button>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex gap-8 items-center">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xl font-semibold text-black hover:text-blue-500"
                onClick={() => onSelectPage?.(link.href)}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-2">
                <Image
                  src={user.photoURL || "/default.png"}
                  alt="profile"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="text-black">{user.displayName}</span>
                <span
                  onClick={logout}
                  className="text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200"
                >
                  로그아웃
                </span>
              </div>
            ) : (
              <span
                onClick={login}
                className="cursor-pointer text-black hover:text-pink-500 transition-colors duration-200"
              >
                구글 로그인
              </span>
            )}
          </div>

          {/* 모바일 메뉴 */}
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-bold text-lg text-black">메뉴</h2>
              <button
                className="text-xl font-bold text-black"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-4">
              {menuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xl font-semibold text-black hover:text-blue-500"
                  onClick={() => {
                    setOpen(false);
                    onSelectPage?.(link.href);
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="flex flex-col gap-2 mt-4 items-start">
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.photoURL || "/default.png"}
                      alt="profile"
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <span className="text-black">{user.displayName}</span>
                  </div>
                  <span
                    onClick={logout}
                    className="text-red-500 cursor-pointer hover:text-red-700 transition-colors duration-200"
                  >
                    로그아웃
                  </span>
                </div>
              ) : (
                <span
                  onClick={login}
                  className="cursor-pointer text-black hover:text-pink-500 transition-colors duration-200 mt-4 inline-block"
                >
                  구글 로그인
                </span>
              )}
            </nav>
          </div>

          {/* 배경 클릭 시 메뉴 닫기 */}
          {open && (
            <div
              className="fixed inset-0 bg-black opacity-30 z-40"
              onClick={() => setOpen(false)}
            />
          )}
        </nav>
      </header>

      {/* navbar 높이만큼 여백 */}
      <div className="h-20 md:h-20" />
    </>
  );
}

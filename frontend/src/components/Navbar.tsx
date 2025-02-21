"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 */}
      <Link href="/" className="text-xl font-bold text-blue-400">
        Gon.G
      </Link>

      {/* 내비게이션 메뉴 */}
      <div className="flex space-x-4">
        <Link href="/" className="hover:text-blue-400">
          홈
        </Link>
        <Link href="/pricing" className="hover:text-blue-400">
          결제
        </Link>
        <Link href="/dashboard" className="hover:text-blue-400">
          대시보드
        </Link>
      </div>

      {/* 로그인 / 로그아웃 버튼 */}
      <div>
        {user ? (
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="bg-red-500 px-4 py-2 rounded-md"
          >
            로그아웃
          </button>
        ) : (
          <Link href="/login" className="bg-blue-500 px-4 py-2 rounded-md">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}

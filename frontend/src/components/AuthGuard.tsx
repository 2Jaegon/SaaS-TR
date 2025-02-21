"use client";

import { useState, useEffect } from "react";
import { observeAuthState } from "@/firebase";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      if (!user) {
        router.push("/login");  // ✅ 로그인하지 않은 사용자는 로그인 페이지로 이동
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return <p>🔄 로그인 확인 중...</p>;

  return <>{children}</>;
}

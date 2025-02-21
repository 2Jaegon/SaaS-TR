"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  // ✅ 페이지 이동을 위한 useRouter 추가
import { login, register, logout, observeAuthState } from "@/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  const router = useRouter();  // ✅ useRouter 선언

  // 사용자 로그인 상태 감지
  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setUser(user);
      if (user) {
        router.push("/");  // ✅ 로그인된 사용자는 자동으로 홈으로 이동
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 로그인 핸들러
  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      router.push("/");  // ✅ 로그인 성공 시 홈으로 이동
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 회원가입 핸들러
  const handleRegister = async () => {
    try {
      setError("");
      await register(email, password);
      router.push("/");  // ✅ 회원가입 성공 시 홈으로 이동
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h2>로그인 / 회원가입</h2>
      
      {user ? (
        <div>
          <p>환영합니다, {user.email}님!</p>
          <button onClick={handleLogout} style={{ marginTop: "10px", padding: "10px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>로그아웃</button>
        </div>
      ) : (
        <div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: "10px", margin: "5px 0" }}
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: "10px", margin: "5px 0" }}
          />
          <button onClick={handleLogin} style={{ width: "100%", padding: "10px", marginTop: "10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}>로그인</button>
          <button onClick={handleRegister} style={{ width: "100%", padding: "10px", marginTop: "5px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px" }}>회원가입</button>
        </div>
      )}
    </div>
  );
}

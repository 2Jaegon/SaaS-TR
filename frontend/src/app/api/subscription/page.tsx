"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/subscription?userID=${user.uid}`);
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error("🚨 구독 상태 확인 실패:", error);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: user.uid }),
      });

      const data = await response.json();
      if (data.success) {
        alert("구독이 취소되었습니다.");
        setIsSubscribed(false);
      } else {
        alert("구독 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("🚨 구독 취소 실패:", error);
      alert("서버 오류로 구독 취소에 실패했습니다.");
    }
  };

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h1>📜 구독 관리</h1>
      {loading ? (
        <p>⏳ 구독 상태 확인 중...</p>
      ) : isSubscribed ? (
        <div>
          <p>✅ 현재 구독 중입니다.</p>
          <button onClick={handleCancelSubscription} style={{ backgroundColor: "#ff0000", color: "#fff", padding: "10px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
            구독 취소하기
          </button>
        </div>
      ) : (
        <p>❌ 구독하지 않았습니다.</p>
      )}
    </div>
  );
}

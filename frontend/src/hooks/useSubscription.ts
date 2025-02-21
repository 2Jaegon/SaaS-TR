"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface SubscriptionData {
  isSubscribed: boolean;
  subscriptionId: string | null;
  startDate: string | null;
  endDate: string | null;
}

export default function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/subscription?userID=${user.uid}`);
        if (!response.ok) throw new Error("구독 정보를 가져오지 못했습니다.");

        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("🚨 구독 정보 요청 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  return { subscription, loading };
}

"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function Subscribe() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId: string) => {
    setLoading(true);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });

    setLoading(false);
  };

  return (
    <div>
      <h2>프리미엄 번역 서비스 구독</h2>
      <button disabled={loading} onClick={() => handleCheckout("price_12345")}>
        {loading ? "결제 진행 중..." : "구독하기"}
      </button>
    </div>
  );
}

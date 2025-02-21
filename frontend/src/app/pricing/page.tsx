"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

export default function PricingPage() {
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = (orderID: string) => {
    console.log("✅ 결제 완료:", orderID);
    setPaid(true);
  };

  const handleError = (err: any) => {
    console.error("🚨 결제 오류:", err);
    setError(err);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Gon.G 요금제</h1>

      {/* 요금제 정보 */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-blue-400 mb-2">DeepL Pro 번역</h2>
        <p className="text-gray-300">더 높은 품질의 번역을 원하신다면 구독하세요!</p>
        <p className="text-lg font-bold mt-2">$9.99 / 월</p>
      </div>

      {/* PayPal 결제 버튼 */}
      <div className="mt-6">
        {paid ? (
          <p className="text-green-400">✅ 결제가 완료되었습니다! 감사합니다.</p>
        ) : (
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: "DeepL Pro 번역 구독",
                    amount: { value: "9.99" },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (actions.order) {
                const details = await actions.order.capture();
                handleApprove(details.id);
              }
            }}
            onError={handleError}
          />
        )}
      </div>

      {error && <p className="text-red-500 mt-4">❌ 결제 오류: {error}</p>}
    </div>
  );
}

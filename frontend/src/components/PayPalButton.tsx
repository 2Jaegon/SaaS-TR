"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "@/context/AuthContext"; // ✅ 사용자 인증 정보 가져오기
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayPalButton() {
  const { user, setIsSubscribed } = useAuth(); // ✅ 구독 상태 업데이트 추가
  const router = useRouter();
  const [loading, setLoading] = useState(false); // ✅ 결제 진행 중 상태 추가

  if (!user) {
    return <p style={{ color: "#fff", textAlign: "center" }}>로그인이 필요합니다.</p>;
  }

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID! }}>
      <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#222", borderRadius: "10px" }}>
        <h3 style={{ color: "#fff", marginBottom: "10px" }}>프리미엄 번역 서비스 결제</h3>
        
        {loading && <p style={{ color: "#fff" }}>⏳ 결제 진행 중...</p>} {/* ✅ 결제 진행 중 메시지 추가 */}

        <PayPalButtons
          style={{ layout: "vertical", color: "blue", shape: "rect" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00", // ✅ 결제 금액 (USD)
                  },
                  custom_id: user.uid, // ✅ 사용자 ID 추가 (웹훅에서 참조)
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            setLoading(true); // ✅ 결제 진행 상태 업데이트
            return actions.order?.capture().then(async (details) => {
              alert(`🎉 결제가 완료되었습니다! ${details.payer.name.given_name}님 감사합니다.`);

              // ✅ 백엔드 웹훅 호출하여 사용자 정보 저장
              const response = await fetch("/api/paypal/webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event_type: "CHECKOUT.ORDER.APPROVED",
                  resource: {
                    id: details.id,
                    payer: { payer_id: user.uid }, // ✅ 사용자 ID 전달
                    purchase_units: [{ custom_id: user.uid }],
                  },
                }),
              });

              const result = await response.json();
              if (result.success) {
                setIsSubscribed(true); // ✅ 구독 상태 업데이트
                router.push("/"); // ✅ 결제 완료 후 홈으로 이동
              } else {
                alert("🚨 결제 처리 중 문제가 발생했습니다. 고객 지원에 문의해주세요.");
              }

              setLoading(false); // ✅ 결제 진행 상태 종료
            });
          }}
          onError={() => {
            setLoading(false); // ✅ 오류 발생 시 로딩 해제
            alert("🚨 결제 중 오류가 발생했습니다. 다시 시도해주세요.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

"use client";

import PayPalButton from "@/components/PayPalButton";

export default function PremiumPage() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      backgroundColor: "#121212", 
      color: "#ffffff",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>프리미엄 번역 서비스</h1>
      <p style={{ fontSize: "16px", marginBottom: "20px", textAlign: "center" }}>
        더 높은 품질의 번역을 원하시나요? 프리미엄 번역 서비스를 구독하세요!
      </p>
      <PayPalButton />
    </div>
  );
}

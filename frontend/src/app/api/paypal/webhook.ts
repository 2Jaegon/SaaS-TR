import { NextResponse } from "next/server";
import { db } from "@/firebase"; // Firestore 데이터베이스 가져오기
import { collection, doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 PayPal Webhook 데이터:", body);

    if (body.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderID = body.resource.id;
      const payerID = body.resource.payer.payer_id;
      const userID = body.resource.purchase_units[0]?.custom_id; // ✅ 사용자 ID 전달됨

      console.log("✅ 결제 승인 완료:", orderID, payerID, userID);

      if (!userID) {
        console.error("🚨 사용자 ID 누락!");
        return NextResponse.json({ success: false, error: "사용자 ID 없음" }, { status: 400 });
      }

      // ✅ Firestore에서 사용자 문서 업데이트
      const userRef = doc(collection(db, "users"), userID);
      await setDoc(
        userRef,
        {
          isSubscribed: true,
          orderID,
          payerID,
          updatedAt: new Date(),
        },
        { merge: true } // 기존 데이터 유지하며 업데이트
      );

      console.log("🎉 사용자 구독 상태 업데이트 완료:", userID);
      return NextResponse.json({ success: true, orderID });
    }

    return NextResponse.json({ success: false, message: "잘못된 이벤트" }, { status: 400 });
  } catch (error) {
    console.error("🚨 Webhook 처리 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

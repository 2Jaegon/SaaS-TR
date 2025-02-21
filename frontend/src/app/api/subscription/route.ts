import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Firestore 연결

export async function GET(req: Request) {
  try {
    // ✅ URL에서 userID 가져오기
    const { searchParams } = new URL(req.url);
    const userID = searchParams.get("userID");

    if (!userID) {
      return NextResponse.json({ error: "사용자 ID가 없습니다." }, { status: 400 });
    }

    // ✅ Firestore에서 사용자 정보 가져오기
    const userRef = doc(db, "users", userID);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ isSubscribed: false }); // 기본적으로 구독 안 한 상태
    }

    const userData = userSnap.data();

    // ✅ 추가한 코드: 구독 정보 세부적으로 확인
    const subscriptionRef = doc(db, "subscriptions", userID);
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (!subscriptionSnap.exists()) {
      return NextResponse.json({ isSubscribed: false, subscriptionId: null });
    }

    const subscriptionData = subscriptionSnap.data();
    const isSubscribed = subscriptionData.isSubscribed || false;
    const subscriptionId = subscriptionData.subscriptionId || null;
    const startDate = subscriptionData.startDate || null;
    const endDate = subscriptionData.endDate || null;

    return NextResponse.json({
      isSubscribed,
      subscriptionId,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error("🚨 Firestore 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

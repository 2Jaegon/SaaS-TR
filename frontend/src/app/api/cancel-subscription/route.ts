import { NextResponse } from "next/server";
import { db } from "@/firebaseAdmin"; // ✅ Firebase Admin SDK 가져오기

export async function POST(req: Request) {
  try {
    const { userID } = await req.json();

    if (!userID) {
      return NextResponse.json({ error: "유저 ID 필요함" }, { status: 400 });
    }

    // Firestore에서 구독 정보 삭제
    await db.collection("subscriptions").doc(userID).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🚨 구독 취소 실패:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

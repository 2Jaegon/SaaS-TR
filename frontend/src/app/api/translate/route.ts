import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function POST(req: Request) {
  try {
    const { text, sourceLang, targetLang, userID } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "번역할 텍스트와 대상 언어가 필요합니다." }, { status: 400 });
    }

    // ✅ 사용자 인증 정보 가져오기
    if (!userID) {
      return NextResponse.json({ error: "인증된 사용자가 아닙니다." }, { status: 401 });
    }

    // ✅ Firestore에서 사용자 구독 정보 확인
    const userRef = doc(db, "users", userID);
    const userSnap = await getDoc(userRef);
    const isSubscribed = userSnap.exists() ? userSnap.data().isSubscribed : false;

    // ✅ 구독 여부에 따라 번역 API 분기
    let translationResult;

    if (isSubscribed) {
      console.log("🔹 프리미엄 사용자: DeepL API 사용");
      translationResult = await translateWithDeepL(text, sourceLang, targetLang);
    } else {
      console.log("🔹 무료 사용자: OpenAI API 사용");
      translationResult = await translateWithOpenAI(text, sourceLang, targetLang);
    }

    if (!translationResult) {
      return NextResponse.json({ error: "번역 실패" }, { status: 500 });
    }

    return NextResponse.json({ translation: translationResult });

  } catch (error) {
    console.error("🚨 번역 API 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// ✅ 프리미엄 사용자: DeepL 번역 API 호출
async function translateWithDeepL(text: string, sourceLang: string, targetLang: string) {
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

  if (!DEEPL_API_KEY) {
    console.error("🚨 DeepL API 키가 설정되지 않았습니다.");
    return null;
  }

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase()
    }),
  });

  const data = await response.json();
  return data.translations?.[0]?.text || null;
}

// ✅ 무료 사용자: OpenAI API 호출
async function translateWithOpenAI(text: string, sourceLang: string, targetLang: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("🚨 OpenAI API 키가 설정되지 않았습니다.");
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional translator. Please translate the text accurately." },
        { role: "user", content: `Translate from ${sourceLang} to ${targetLang}: "${text}"` }
      ]
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

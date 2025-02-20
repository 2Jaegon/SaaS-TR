export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      console.error("🚨 DeepL API 키가 없습니다.");
      return Response.json({ error: "DeepL API 키가 없습니다." }, { status: 500 });
    }

    console.log("📨 DeepL 번역 요청:", { text, targetLang });
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        auth_key: process.env.DEEPL_API_KEY,
        text: text,
        target_lang: targetLang.toUpperCase(),
      }),
    });
    

    console.log("🔄 DeepL 응답 상태 코드:", response.status);

    if (!response.ok) {
      console.error("🚨 DeepL API 요청 실패:", await response.text());
      return Response.json({ error: "DeepL API 요청 실패" }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ DeepL 번역 결과:", data);

    return Response.json({ translation: data.translations[0].text });
  } catch (error) {
    console.error("🚨 서버 오류:", error);
    return Response.json({ error: "번역 요청 실패" }, { status: 500 });
  }
}

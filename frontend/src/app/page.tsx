"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import PayPalButton from "@/components/PayPalButton"; // ✅ PayPal 결제 버튼 추가
import { useAuth } from "@/context/AuthContext"; // ✅ 사용자 정보 가져오기

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// 번역 가능한 언어 리스트
const languages = [
  { code: "EN", name: "English" },
  { code: "KO", name: "한국어 (Korean)" },
  { code: "JA", name: "日本語 (Japanese)" },
  { code: "ZH", name: "中文 (Chinese)" },
  { code: "FR", name: "Français (French)" },
  { code: "DE", name: "Deutsch (German)" },
  { code: "ES", name: "Español (Spanish)" },
  { code: "IT", name: "Italiano (Italian)" },
  { code: "NL", name: "Nederlands (Dutch)" },
  { code: "PL", name: "Polski (Polish)" },
  { code: "PT", name: "Português (Portuguese)" },
  { code: "RU", name: "Русский (Russian)" },
];

export default function Home() {
  const { user } = useAuth(); // ✅ 로그인한 사용자 정보 가져오기
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false); // ✅ 구독 상태 저장
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("감지 중...");
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("KO");
  const [loading, setLoading] = useState<boolean>(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Firestore에서 구독 상태 확인
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return; // 로그인하지 않은 경우 확인 안함
      try {
        const response = await fetch(`/api/subscription?userID=${user.uid}`);
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error("🚨 구독 상태 확인 실패:", error);
      }
    };

    checkSubscription();
  }, [user]);

  // 파일 업로드 함수
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop,
  });

  // 언어 감지 함수
  const detectLanguage = async (text: string) => {
    setDetectedLanguage("감지 중...");
    setSourceLang("auto");

    const response = await fetch("/api/detect-language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setDetectedLanguage(languages.find((lang) => lang.code === data.language)?.name || "알 수 없음");
    setSourceLang(data.language);
  };

  // 텍스트 선택 시 실행
  const handleMouseUp = () => {
    if (!pdfContainerRef.current) return;
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString();
      setSelectedText(text);
      detectLanguage(text);
    }
  };

  // 번역 요청 함수 (구독 여부 체크 추가)
  const translateText = async () => {
    if (!selectedText) return;
    setLoading(true);

    if (!isSubscribed) {
      alert("⚠️ DeepL 번역 기능은 구독 후 사용할 수 있습니다. 결제를 진행해주세요.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, sourceLang, targetLang }),
      });

      if (!response.ok) {
        setTranslatedText("번역 실패: 서버 오류");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTranslatedText(data.translation || "번역 실패");
    } catch (error) {
      setTranslatedText("번역 실패: 네트워크 오류");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#121212", color: "#ffffff" }}>
      {/* 왼쪽 패널 */}
      <div style={{
        width: "30%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        borderRight: "2px solid #333",
        backgroundColor: "#1e1e1e"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#00c3ff", marginBottom: "10px" }}>Gon.G</h2>

        {/* 선택한 텍스트 박스 */}
        <div style={{ 
          border: "2px solid #00c3ff",
          borderRadius: "8px",
          padding: "10px",
          minHeight: "80px",
          maxHeight: "150px",
          overflowY: "auto",
          backgroundColor: "#222",
          marginBottom: "10px"
        }}>
          <h4 style={{ color: "#ffffff" }}>🔍 선택한 텍스트:</h4>
          <p style={{ color: "#ffffff" }}>{selectedText || "PDF에서 번역할 텍스트를 드래그하세요."}</p>
        </div>

        {/* 번역된 텍스트 박스 */}
        <div style={{ 
          border: "2px solid #28a745",
          borderRadius: "8px",
          padding: "10px",
          minHeight: "200px",
          maxHeight: "400px",
          overflowY: "auto",
          backgroundColor: "#222",
          marginBottom: "10px"
        }}>
          <h4 style={{ color: "#ffffff" }}>🎯 번역된 텍스트:</h4>
          {loading ? <p style={{ color: "#ffffff" }}>⏳ 번역 중...</p> : <p style={{ color: "#ffffff" }}>{translatedText || "번역 결과가 여기에 표시됩니다."}</p>}
        </div>

        {/* ✅ PayPal 결제 버튼 추가 (구독하지 않은 경우만 보이도록 설정) */}
        {!isSubscribed && (
          <div style={{ marginBottom: "10px" }}>
            <h4 style={{ color: "#ffffff" }}>💳 DeepL 고급 번역을 사용하려면 구독하세요!</h4>
            <PayPalButton />
          </div>
        )}

        {/* 번역 버튼 */}
        <button onClick={translateText} 
          style={{ width: "100%", padding: "10px", backgroundColor: isSubscribed ? "#00c3ff" : "#666", color: "#fff", border: "none", borderRadius: "5px", cursor: isSubscribed ? "pointer" : "not-allowed", marginBottom: "10px" }}
          disabled={!isSubscribed}
        >
          {isSubscribed ? "DeepL 고급 번역" : "OpenAI 일반 번역"}
        </button>
      </div>
    </div>
  );
}

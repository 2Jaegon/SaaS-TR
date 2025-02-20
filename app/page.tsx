"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// 번역 가능한 언어 리스트 (각 국가의 언어로 표기)
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");

  const [detectedLanguage, setDetectedLanguage] = useState<string>("감지 중..."); // 감지된 언어
  const [sourceLang, setSourceLang] = useState<string>("auto"); // 감지된 언어 (자동 감지)
  const [targetLang, setTargetLang] = useState<string>("KO"); // 번역할 언어

  const [loading, setLoading] = useState<boolean>(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // 파일 업로드 함수
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);

    // PDF 파일을 URL로 변환하여 화면에 표시
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop,
  });

  // 텍스트 선택 시 감지된 언어를 표시하는 함수
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

  // 텍스트 선택 시 처리하는 함수
  const handleMouseUp = () => {
    if (!pdfContainerRef.current) return;
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString();
      setSelectedText(text);
      detectLanguage(text); // 감지된 언어 표시
    }
  };

  // OpenAI 번역 요청 함수
  const translateText = async () => {
    if (!selectedText) return;
    setLoading(true);
  
    console.log("📨 DeepL 번역 요청:", { text: selectedText, targetLang });
  
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: selectedText, targetLang }),
        });
    
        console.log("🔄 응답 상태 코드:", response.status);
    
        if (!response.ok) {
          console.error("🚨 API 요청 실패:", await response.text());
          setTranslatedText("번역 실패: 서버 오류");
          setLoading(false);
          return;
        }
          const data = await response.json();
          console.log("✅ 번역 결과:", data);
      
          setTranslatedText(data.translation || "번역 실패");
        } catch (error) {
          console.error("🚨 번역 요청 중 오류 발생:", error);
          setTranslatedText("번역 실패: 네트워크 오류");
        }
      setLoading(false);
    };

    return (
      <div style={{ display: "flex", height: "100vh", backgroundColor: "#121212", color: "#ffffff" }}>  {/* ✅ 배경 검정, 글씨 흰색 */}
        {/* 왼쪽 (번역 결과 및 업로드 UI) */}
        <div style={{ 
          width: "30%", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between", 
          padding: "20px", 
          borderRight: "2px solid #333",  /* ✅ 테두리 어두운 회색 */
          backgroundColor: "#1e1e1e" /* ✅ 패널 색상 */
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#00c3ff", marginBottom: "10px" }}>Gon.G</h2>  {/* ✅ 파란색 포인트 컬러 */}
    
          {/* 선택한 텍스트 박스 */}
          <div style={{ 
            border: "2px solid #00c3ff",  /* ✅ 파란색 테두리 */
            borderRadius: "8px", 
            padding: "10px", 
            minHeight: "80px", 
            maxHeight: "150px", 
            overflowY: "auto", 
            backgroundColor: "#222", /* ✅ 어두운 배경 */
            marginBottom: "10px" 
          }}>
            <h4 style={{ color: "#ffffff" }}>🔍 선택한 텍스트:</h4>
            <p style={{ color: "#ffffff" }}>{selectedText || "PDF에서 번역할 텍스트를 드래그하세요."}</p>
          </div>
    
          {/* 번역된 텍스트 박스 */}
          <div style={{ 
            border: "2px solid #28a745", /* ✅ 초록색 테두리 */
            borderRadius: "8px", 
            padding: "10px", 
            minHeight: "480px", 
            maxHeight: "900px", 
            overflowY: "auto", 
            backgroundColor: "#222",  /* ✅ 어두운 배경 */
            marginBottom: "10px"
          }}>
            <h4 style={{ color: "#ffffff" }}>🎯 번역된 텍스트:</h4>
            {loading ? <p style={{ color: "#ffffff" }}>⏳ 번역 중...</p> : <p style={{ color: "#ffffff" }}>{translatedText || "번역 결과가 여기에 표시됩니다."}</p>}
          </div>
    
          {/* A → B 번역 선택 UI */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "10px", 
            color: "#ffffff" 
          }}>
            <strong style={{ color: "#ffffff" }}>{detectedLanguage}</strong>  
            <span style={{ margin: "0 10px", fontSize: "20px", color: "#ffffff" }}>→</span>  
            <select onChange={(e) => setTargetLang(e.target.value)} value={targetLang} 
              style={{ padding: "5px", backgroundColor: "#333", color: "#ffffff", border: "1px solid #ffffff" }}>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
    
          {/* 번역 버튼 */}
          <button onClick={translateText} 
            style={{ 
              width: "100%", 
              padding: "10px", 
              backgroundColor: "#00c3ff",  /* ✅ 버튼 파란색 */
              color: "#fff", 
              border: "none", 
              borderRadius: "5px", 
              cursor: "pointer"
            }}>
            번역하기
          </button>
    
          {/* PDF 업로드 UI */}
          <div>
            {uploadedFile && <p style={{ fontSize: "12px", color: "#ffffff", textAlign: "center", marginBottom: "5px" }}>📄 {uploadedFile.name}</p>}
    
            <div {...getRootProps()} 
              style={{ 
                border: "2px dashed #00c3ff",  /* ✅ 파란색 테두리 */
                padding: "15px", 
                cursor: "pointer", 
                textAlign: "center", 
                fontSize: "12px", 
                borderRadius: "6px", 
                backgroundColor: "#222", /* ✅ 어두운 배경 */
                color: "#ffffff"
              }}>
              <input {...getInputProps()} />
              <p>📂 PDF 파일을 드래그하거나 클릭하여 업로드하세요</p>
            </div>
          </div>
        </div>
    
        {/* 오른쪽 (PDF 뷰어) */}
        <div style={{ 
          width: "70%", 
          padding: "20px", 
          display: "flex", 
          flexDirection: "column",
          backgroundColor: "#121212"  /* ✅ 전체 배경 검정 */
        }}>
          {pdfUrl && (
            <div ref={pdfContainerRef} onMouseUp={handleMouseUp} 
              style={{ 
                border: "1px solid #00c3ff",  /* ✅ 파란색 테두리 */
                padding: "10px", 
                overflowY: "auto",  
                height: "100vh",    
                backgroundColor: "#1e1e1e"  /* ✅ 다크 모드 */
              }}>
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js`}>
                <Viewer fileUrl={pdfUrl} />
              </Worker>
            </div>
          )}
        </div>
      </div>
    );
    
}

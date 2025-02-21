import type { Metadata } from "next";
import Script from "next/script"; // ✅ PayPal SDK 추가
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar"; // ✅ 네비게이션 추가

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gon.G",
  description: "AI 기반 번역 SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <html lang="en">
        {/* ✅ PayPal SDK 로드 */}
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
          strategy="beforeInteractive" // 페이지가 로드되기 전에 SDK 로드
        />

        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Navbar /> {/* ✅ 네비게이션 바 추가 */}
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}

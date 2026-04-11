import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "GrowthManager | 보험 설계사 영업 관리 시스템",
  description: "실시간 실적 트래킹 및 팀원 모니터링을 위한 프리미엄 솔루션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[var(--canvas)] text-[var(--off-black)] antialiased`}>
        <AuthProvider>
          <div className="min-h-screen max-w-screen-2xl mx-auto">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ロスタ - 勤怠・シフト管理 SaaS",
  description: "複数店舗対応の勤怠・シフト管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-50/30`}
      >
        <NavigationWrapper>{children}</NavigationWrapper>
      </body>
    </html>
  );
}

async function NavigationWrapper({ children }: { children: React.ReactNode }) {
  // ログインページではナビゲーションを表示しない
  // 各ページで個別に制御する
  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

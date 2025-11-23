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
  const { getCurrentUser, isUserAdmin } = await import('@/lib/actions/auth')
  const { headers } = await import('next/headers')
  
  const { data: user } = await getCurrentUser()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // ログインページではナビゲーションを表示しない
  if (!user || pathname === '/login') {
    return (
      <main className="min-h-screen">{children}</main>
    )
  }

  const isAdmin = await isUserAdmin(user.id)

  // 型を合わせるために必要なプロパティのみを抽出
  const navigationUser = {
    id: user.id,
    email: user.email,
    profile: user.profile,
  }

  return (
    <>
      <Navigation user={navigationUser} isAdmin={isAdmin} />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

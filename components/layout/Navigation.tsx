'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface NavigationProps {
  user: {
    id: string
    email?: string
    profile?: {
      last_name?: string | null
      first_name?: string | null
    } | null
  }
  isAdmin: boolean
}

export default function Navigation({ user, isAdmin }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // ログインページではナビゲーションを表示しない
  if (!user || pathname === '/login') {
    return null
  }

  const userEmail = user.email || ''
  const isAdminPage = pathname.startsWith('/admin')

  // サイドバーを閉じる
  const closeSidebar = () => setIsSidebarOpen(false)

  // パスが変更されたらサイドバーを閉じる
  useEffect(() => {
    closeSidebar()
  }, [pathname])

  // オーバーレイクリックでサイドバーを閉じる
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSidebarOpen])

  return (
    <>
      {/* デスクトップ: 上部ナビゲーション */}
      <nav className="hidden md:block sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-lg shadow-sm dark:border-gray-700 dark:bg-gray-800/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm transition-all group-hover:bg-blue-700 group-hover:shadow-md dark:bg-blue-500">
                <span className="text-lg font-bold text-white">ロ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
                ロスタ
              </span>
            </Link>
              <div className="flex space-x-1">
                {isAdminPage ? (
                  <NavLink href="/admin" label="管理" pathname={pathname} />
                ) : (
                  <>
                    <NavLink href="/clock" label="打刻" pathname={pathname} />
                    <NavLink href="/shifts" label="シフト" pathname={pathname} />
                    {isAdmin && <NavLink href="/admin" label="管理" pathname={pathname} />}
                  </>
                )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.profile?.last_name && user.profile?.first_name 
                ? `${user.profile.last_name} ${user.profile.first_name}` 
                : userEmail}
              </span>
            <form action={async () => {
              await signOut()
            }}>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>

      {/* モバイル: 上部バー（ハンバーガーメニュー付き） */}
      <nav className="md:hidden sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-lg shadow-sm dark:border-gray-700 dark:bg-gray-800/95">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <span className="text-lg font-bold text-white">ロ</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
              ロスタ
            </span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label="メニューを開く"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* モバイル: サイドバーオーバーレイ */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* モバイル: サイドバー */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* サイドバーヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-blue-100 dark:border-gray-700">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm dark:bg-blue-500">
                <span className="text-lg font-bold text-white">ロ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
                ロスタ
              </span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label="メニューを閉じる"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ナビゲーションリンク */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {isAdminPage ? (
              <SidebarNavLink href="/admin" label="管理" pathname={pathname} onClick={closeSidebar} />
            ) : (
              <>
                <SidebarNavLink href="/clock" label="打刻" pathname={pathname} onClick={closeSidebar} />
                <SidebarNavLink href="/shifts" label="シフト" pathname={pathname} onClick={closeSidebar} />
                {isAdmin && <SidebarNavLink href="/admin" label="管理" pathname={pathname} onClick={closeSidebar} />}
              </>
            )}
          </nav>

          {/* ユーザー情報とログアウト */}
          <div className="border-t border-blue-100 p-4 space-y-3 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <ThemeToggle />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                {user.profile?.last_name && user.profile?.first_name 
                  ? `${user.profile.last_name} ${user.profile.first_name}` 
                  : userEmail}
              </p>
              <p className="text-xs text-gray-500 truncate dark:text-gray-400">{userEmail}</p>
            </div>
            <form action={async () => {
              await signOut()
            }} className="w-full">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-700 text-left dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const isAdminPage = pathname.startsWith('/admin')
  
  // 管理画面の場合は紫色のスタイルを使用
  if (isAdminPage) {
    return (
      <Link
        href={href}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          isActive
            ? 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
            : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-300 dark:hover:bg-purple-900/20'
        }`}
      >
        {label}
      </Link>
    )
  }
  
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30'
          : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/20'
      }`}
    >
      {label}
    </Link>
  )
}

function SidebarNavLink({ 
  href, 
  label, 
  pathname, 
  onClick 
}: { 
  href: string
  label: string
  pathname: string
  onClick: () => void
}) {
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const isAdminPage = pathname.startsWith('/admin')
  
  // 管理画面の場合は紫色のスタイルを使用
  if (isAdminPage) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
          isActive
            ? 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
            : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-300 dark:hover:bg-purple-900/20'
        }`}
      >
        {label}
      </Link>
    )
  }
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
        isActive
          ? 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30'
          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-300 dark:hover:bg-blue-900/20'
      }`}
    >
      {label}
    </Link>
  )
}

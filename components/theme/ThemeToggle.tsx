'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState, startTransition } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // マウント後にレンダリング（ハイドレーションエラーを防ぐ）
  useEffect(() => {
    // マウント状態を非緊急の更新として扱う
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        aria-label="テーマ切り替え"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>
    )
  }

  // resolvedThemeを使用して現在のテーマを取得
  const currentTheme = resolvedTheme || theme || 'light'
  const isDark = currentTheme === 'dark'

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {isDark ? (
        // 太陽アイコン（ライトモードに切り替え）
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // 月アイコン（ダークモードに切り替え）
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}


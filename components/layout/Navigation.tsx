import Link from 'next/link'
import { getCurrentUser, isUserAdmin, signOut } from '@/lib/actions/auth'
import { headers } from 'next/headers'

export default async function Navigation() {
  const { data: user } = await getCurrentUser()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // ログインページではナビゲーションを表示しない
  if (!user || pathname === '/login') {
    return null
  }

  // ユーザーが管理者かどうかを確認
  const isAdmin = await isUserAdmin(user.id)

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm transition-all group-hover:bg-blue-700 group-hover:shadow-md">
                <span className="text-lg font-bold text-white">ロ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                ロスタ
              </span>
            </Link>
            <div className="hidden md:flex space-x-1">
              <NavLink href="/clock" label="打刻" />
              <NavLink href="/shifts" label="シフト" />
              {isAdmin && <NavLink href="/admin" label="管理" />}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
                {user.profile?.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.profile?.name || user.email}
              </span>
            </div>
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-blue-50 hover:text-blue-700"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative px-4 py-2 text-sm font-medium text-gray-600 transition-all rounded-lg hover:text-blue-700 hover:bg-blue-50"
    >
      {label}
    </Link>
  )
}


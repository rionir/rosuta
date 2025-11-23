import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  try {
    const { data: user } = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <h1 className="text-xl font-bold text-gray-900">ロスタ</h1>
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link
                    href="/clock"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    打刻
                  </Link>
                  <Link
                    href="/shifts"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    シフト
                  </Link>
                  <Link
                    href="/admin"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    管理
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700">{user.profile?.name || user.email}</span>
                <form action="/api/auth/signout" method="post" className="ml-4">
                  <button
                    type="submit"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900">ようこそ、{user.profile?.name || 'ユーザー'}さん</h2>
              <p className="mt-2 text-gray-600">
                ロスタのダッシュボードへようこそ。左側のメニューから機能を選択してください。
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    // エラーが発生した場合はログインページにリダイレクト
    console.error('Home page error:', error)
    redirect('/login')
  }
}

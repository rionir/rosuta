import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/presentation/auth/actions/auth'
import LoginForm from '@/components/auth/LoginForm'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // 既にログインしている場合はダッシュボードにリダイレクト
  const userResult = await getCurrentUser()
  if (!('error' in userResult) && userResult.data) {
    redirect('/app/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-lg ring-1 ring-blue-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-md dark:bg-blue-500">
            <span className="text-4xl font-bold text-white">ロ</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            ロスタにログイン
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            勤怠・シフト管理システム
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}


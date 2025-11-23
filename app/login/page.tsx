import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  // ログインページでは認証チェックをスキップ（認証が必要な場合はmiddlewareで処理）
  // try {
  //   const { data: user } = await getCurrentUser()
  //   if (user) {
  //     redirect('/')
  //   }
  // } catch (error) {
  //   console.error('Login page error:', error)
  // }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-lg ring-1 ring-blue-100">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
            <span className="text-4xl font-bold text-white">ロ</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            ロスタにログイン
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            勤怠・シフト管理システム
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}


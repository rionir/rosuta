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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            ロスタにログイン
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}


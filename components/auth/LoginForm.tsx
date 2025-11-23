'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/actions/auth'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(formData)
      
      if (result?.error) {
        console.error('Login error:', result.error)
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.success) {
        // 成功時はリダイレクト
        router.push('/')
        router.refresh()
      } else {
        setError('ログインに失敗しました')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </div>
    </form>
  )
}


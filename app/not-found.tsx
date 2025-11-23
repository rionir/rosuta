import Link from 'next/link'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 p-4">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-10 shadow-lg ring-1 ring-blue-100">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
            <span className="text-5xl font-bold text-white">404</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            ページが見つかりません
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
          >
            ホームに戻る
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-white px-6 py-3 text-base font-semibold text-blue-600 transition-all hover:bg-blue-50"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    </div>
  )
}


import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  try {
    const { data: user } = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const isAdmin = await isUserAdmin(user.id)

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-white px-8 py-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              ようこそ、{user.profile?.name || 'ユーザー'}さん
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              ロスタのダッシュボードへようこそ。下記のカードから機能を選択してください。
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            href="/clock"
            title="打刻"
            description="出勤・退勤・休憩の打刻を行います"
            icon="⏰"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            href="/shifts"
            title="シフト"
            description="シフトの確認と管理を行います"
            icon="📅"
            gradient="from-purple-500 to-pink-500"
          />
          {isAdmin && (
            <FeatureCard
              href="/admin"
              title="管理"
              description="店舗・スタッフ・設定の管理を行います"
              icon="⚙️"
              gradient="from-orange-500 to-red-500"
            />
          )}
        </div>
      </div>
    )
  } catch (error) {
    // エラーが発生した場合はログインページにリダイレクト
    console.error('Home page error:', error)
    redirect('/login')
  }
}

function FeatureCard({
  href,
  title,
  description,
  icon,
  gradient,
}: {
  href: string
  title: string
  description: string
  icon: string
  gradient: string
}) {
  // グラデーションを色に変換（すべてブルー系に統一）
  let bgClass = 'bg-blue-600'
  let hoverClass = 'hover:bg-blue-700'
  
  if (gradient === 'from-blue-500 to-cyan-500') {
    bgClass = 'bg-blue-600'
    hoverClass = 'hover:bg-blue-700'
  } else if (gradient === 'from-purple-500 to-pink-500') {
    bgClass = 'bg-blue-500'
    hoverClass = 'hover:bg-blue-600'
  } else if (gradient === 'from-orange-500 to-red-500') {
    bgClass = 'bg-blue-700'
    hoverClass = 'hover:bg-blue-800'
  }

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-blue-100 transition-all duration-300 hover:shadow-lg hover:ring-blue-200 hover:-translate-y-1"
    >
      <div className="relative">
        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${bgClass} text-2xl text-white shadow-sm transition-all ${hoverClass} group-hover:shadow-md group-hover:scale-110`}>
          {icon}
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 transition-all group-hover:text-blue-700">
          開く
          <svg
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}

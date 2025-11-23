import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const { data: user } = await getCurrentUser()

    if (!user) {
      redirect('/login')
    }

    const isAdmin = await isUserAdmin(user.id)

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
  // すべてのアイコンを同じブルー色に統一（薄めのブルー）
  const bgClass = 'bg-blue-500'
  const hoverClass = 'hover:bg-blue-600'

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
      </div>
    </Link>
  )
}

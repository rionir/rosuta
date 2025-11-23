import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // 管理者権限チェック
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Feature Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          href="/admin/calendar"
          title="カレンダー"
          description="店舗全体・個人別の勤務状況を確認します"
          icon="📅"
          bgColor="bg-blue-600"
        />
        <FeatureCard
          href="/admin/stores"
          title="店舗管理"
          description="店舗の追加・編集・削除を行います"
          icon="🏪"
          bgColor="bg-blue-500"
        />
        <FeatureCard
          href="/admin/users"
          title="スタッフ管理"
          description="スタッフの追加・編集・削除、店舗所属設定を行います"
          icon="users"
          bgColor="bg-blue-700"
        />
        <FeatureCard
          href="/admin/shifts"
          title="シフト管理"
          description="シフトの作成・編集・削除、コピーを行います"
          icon="📋"
          bgColor="bg-blue-600"
        />
        <FeatureCard
          href="/admin/settings"
          title="設定"
          description="打刻承認設定などの店舗設定を管理します"
          icon="⚙️"
          bgColor="bg-blue-500"
        />
        <FeatureCard
          href="/admin/clock-records"
          title="打刻承認"
          description="打刻修正の承認・却下を行います"
          icon="✅"
          bgColor="bg-blue-700"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  href,
  title,
  description,
  icon,
  bgColor,
}: {
  href: string
  title: string
  description: string
  icon: string
  bgColor: string
}) {
  // すべてのアイコンを同じ紫色に統一
  const iconBgClass = 'bg-purple-500'
  const iconHoverClass = 'hover:bg-purple-600'

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-purple-100 transition-all duration-300 hover:shadow-lg hover:ring-purple-200 hover:-translate-y-1"
    >
      <div className="relative">
        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${iconBgClass} text-2xl text-white shadow-sm transition-all ${iconHoverClass} group-hover:shadow-md group-hover:scale-110`}>
          {icon === 'users' ? (
            <svg
              className="h-7 w-7 text-purple-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            icon
          )}
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </Link>
  )
}





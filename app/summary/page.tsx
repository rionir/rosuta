import { getCurrentUser } from '@/lib/actions/auth'
import { getUserStores } from '@/lib/actions/user-stores'
import { redirect } from 'next/navigation'
import WorkSummaryComponent from '@/components/summary/WorkSummaryComponent'

export default async function WorkSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; storeId?: string; period?: 'day' | 'week' | 'month' }>
}) {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーが所属する店舗一覧を取得
  const { data: userStores } = await getUserStores(user.id)

  if (!userStores || userStores.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">店舗未所属</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              勤務実績を確認するには、まず管理者に店舗への所属を依頼してください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // URLパラメータから年月、店舗ID、期間を取得
  const params = await searchParams
  const today = new Date()
  const year = params.year ? parseInt(params.year) : today.getFullYear()
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1
  const selectedStoreId = params.storeId ? parseInt(params.storeId) : undefined
  const period = params.period || 'month'

  return (
    <WorkSummaryComponent
      user={user}
      stores={userStores}
      year={year}
      month={month}
      selectedStoreId={selectedStoreId}
      period={period}
    />
  )
}


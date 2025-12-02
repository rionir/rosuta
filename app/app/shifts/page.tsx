import { getCurrentUser } from '@/presentation/auth/actions/auth'
import { getUserStores } from '@/presentation/store/actions/user-stores'
import { redirect } from 'next/navigation'
import CalendarComponent from '@/components/calendar/CalendarComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; storeId?: string }>
}) {
  const userResult = await getCurrentUser()

  if ('error' in userResult || !userResult.data) {
    redirect('/app/login')
  }

  const user = userResult.data

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
              シフトを確認するには、まず管理者に店舗への所属を依頼してください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // URLパラメータから年月と店舗IDを取得
  const params = await searchParams
  const today = new Date()
  const year = params.year ? parseInt(params.year) : today.getFullYear()
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1
  const selectedStoreId = params.storeId ? parseInt(params.storeId) : undefined

  return (
    <CalendarComponent
      user={user}
      stores={userStores}
      year={year}
      month={month}
      selectedStoreId={selectedStoreId}
    />
  )
}





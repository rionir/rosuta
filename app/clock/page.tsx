import { getCurrentUser } from '@/lib/actions/auth'
import { getUserStores } from '@/lib/actions/user-stores'
import { getCurrentWorkStatus } from '@/lib/actions/clock-records'
import { redirect } from 'next/navigation'
import ClockComponent from '@/components/clock/ClockComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function ClockPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>
}) {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーが所属する店舗一覧を取得
  const { data: userStores } = await getUserStores(user.id)

  if (!userStores || userStores.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">店舗未所属</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              打刻を行うには、まず管理者に店舗への所属を依頼してください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 選択された店舗ID（デフォルトは最初の店舗）
  const params = await searchParams
  const selectedStoreId = params.storeId
    ? parseInt(params.storeId)
    : (userStores[0]?.store_id as number)

  // 現在の勤務ステータスを取得
  const { data: workStatus } = await getCurrentWorkStatus(user.id, selectedStoreId)

  return (
    <ClockComponent
      user={user}
      stores={userStores}
      selectedStoreId={selectedStoreId}
      workStatus={workStatus || null}
    />
  )
}


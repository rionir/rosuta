import { getCurrentUser } from '@/lib/actions/auth'
import { getUserStores } from '@/lib/actions/user-stores'
import { getCurrentWorkStatus } from '@/lib/actions/clock-records'
import { redirect } from 'next/navigation'
import ClockComponent from '@/components/clock/ClockComponent'

export default async function ClockPage({
  searchParams,
}: {
  searchParams: { storeId?: string }
}) {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーが所属する店舗一覧を取得
  const { data: userStores } = await getUserStores(user.id)

  if (!userStores || userStores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">店舗未所属</h2>
          <p className="mt-2 text-gray-600">
            打刻を行うには、まず管理者に店舗への所属を依頼してください。
          </p>
        </div>
      </div>
    )
  }

  // 選択された店舗ID（デフォルトは最初の店舗）
  const selectedStoreId = searchParams.storeId
    ? parseInt(searchParams.storeId)
    : (userStores[0]?.store_id as number)

  // 現在の勤務ステータスを取得
  const { data: workStatus } = await getCurrentWorkStatus(user.id, selectedStoreId)

  return (
    <ClockComponent
      user={user}
      stores={userStores}
      selectedStoreId={selectedStoreId}
      workStatus={workStatus}
    />
  )
}


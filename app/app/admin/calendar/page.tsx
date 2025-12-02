import { getCurrentUser, isUserAdmin } from '@/presentation/auth/actions/auth'
import { getUserStores } from '@/presentation/store/actions/user-stores'
import { getStoreUsers } from '@/presentation/store/actions/user-stores'
import { redirect } from 'next/navigation'
import AdminCalendarComponent from '@/components/admin/AdminCalendarComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; storeId?: string; userId?: string }>
}) {
  const userResult = await getCurrentUser()

  if ('error' in userResult || !userResult.data) {
    redirect('/app/login')
  }

  const user = userResult.data

  // 管理者権限チェック
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    redirect('/app/dashboard')
  }

  // 管理者が管理できる店舗一覧を取得
  const userStoresResult = await getUserStores(user.id)

  if ('error' in userStoresResult || !userStoresResult.data || userStoresResult.data.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">店舗未所属</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              カレンダーを確認するには、まず店舗に所属する必要があります。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // URLパラメータから年月、店舗ID、ユーザーIDを取得
  const params = await searchParams
  const today = new Date()
  const year = params.year ? parseInt(params.year) : today.getFullYear()
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1
  const userStores = userStoresResult.data || []
  const selectedStoreId = params.storeId ? parseInt(params.storeId) : (userStores[0]?.store_id as number)
  const selectedUserId = params.userId || undefined

  // 選択された店舗のユーザー一覧を取得
  const storeUsersResult = selectedStoreId
    ? await getStoreUsers(selectedStoreId)
    : { data: null }
  
  const storeUsersData = !('error' in storeUsersResult) && storeUsersResult.data ? storeUsersResult.data : []

  // UserStoreWithStoreDTOをそのまま使用（nullのcompany_storesをフィルタリング）
  const storesForComponent = userStores.filter((us) => us.company_stores !== null)

  // UserStoreDTOをそのまま使用（usersがnullのものを除外）
  const storeUsersForComponent = storeUsersData.filter((su) => su.users !== null)

  return (
    <AdminCalendarComponent
      user={user}
      stores={storesForComponent}
      storeUsers={storeUsersForComponent}
      year={year}
      month={month}
      selectedStoreId={selectedStoreId}
      selectedUserId={selectedUserId}
    />
  )
}






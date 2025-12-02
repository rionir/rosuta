import { getCurrentUser, isUserAdmin } from '@/presentation/auth/actions/auth'
import { getUserCompanies } from '@/presentation/auth/actions/auth'
import { getCompanyStores } from '@/presentation/store/actions/stores'
import { getStoreUsers } from '@/presentation/store/actions/user-stores'
import { getStoreShifts } from '@/presentation/shift/actions/shifts'
import { redirect } from 'next/navigation'
import ShiftsManagementComponent from '@/components/admin/ShiftsManagementComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function ShiftsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string; year?: string; month?: string }>
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

  // ユーザーが所属する企業一覧を取得
  const { data: companies } = await getUserCompanies(user.id)

  if (!companies || companies.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">企業未所属</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-700 leading-relaxed">
              シフトを管理するには、まず企業に所属する必要があります。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const today = new Date()
  const year = params.year ? parseInt(params.year) : today.getFullYear()
  const month = params.month ? parseInt(params.month) : today.getMonth() + 1

  // 店舗一覧を取得
  const companyId = companies[0].company_id
  const { data: stores } = await getCompanyStores(companyId)

  // storeIdが指定されていない場合、デフォルトで最初の店舗を選択
  const selectedStoreId = params.storeId 
    ? parseInt(params.storeId) 
    : stores && stores.length > 0 
      ? stores[0].id 
      : undefined

  // storeIdが指定されていない場合、URLにリダイレクトしてstoreIdを追加
  if (!params.storeId && selectedStoreId) {
    redirect(`/app/admin/shifts?storeId=${selectedStoreId}&year=${year}&month=${month}`)
  }

  // 選択された店舗のユーザー一覧を取得
  const storeUsers = selectedStoreId ? await getStoreUsers(selectedStoreId) : { data: [] }

  // 選択された店舗のシフト一覧を取得
  // monthは1-12なので、文字列ベースで日付範囲を計算
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  // 月の最後の日を取得（うるう年も考慮）
  const daysInMonth = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
  const shiftsResult = selectedStoreId
    ? await getStoreShifts(selectedStoreId, startDate, endDate)
    : { data: [] }

  // ユーザー情報をマップに変換（storeUsersから取得）
  const userMap = new Map<string, { id: string; last_name: string; first_name: string }>()
  if (storeUsers.data) {
    storeUsers.data.forEach((item: { user_id: string; users: { id: string; last_name: string; first_name: string } | null }) => {
      // usersがオブジェクトの場合と配列の場合の両方に対応
      const userInfo = item.users && !Array.isArray(item.users) ? item.users : null
      if (userInfo && userInfo.id && userInfo.last_name) {
        userMap.set(item.user_id, { 
          id: userInfo.id, 
          last_name: userInfo.last_name,
          first_name: userInfo.first_name
        })
      }
    })
  }

  // シフトデータにユーザー情報をマージ
  const shifts = (shiftsResult.data || []).map((shift) => {
    const userInfo = userMap.get(shift.user_id)
    if (!userInfo) {
      return null
    }
    return {
      ...shift,
      users: userInfo,
    }
  }).filter((shift): shift is typeof shift & { users: { id: string; last_name: string; first_name: string } } => shift !== null) || []

  return (
    <ShiftsManagementComponent
      user={user}
      stores={stores || []}
      storeUsers={storeUsers.data || []}
      shifts={shifts}
      year={year}
      month={month}
      selectedStoreId={selectedStoreId}
    />
  )
}


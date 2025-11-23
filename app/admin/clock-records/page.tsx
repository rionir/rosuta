import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { getUserCompanies } from '@/lib/actions/auth'
import { getCompanyStores } from '@/lib/actions/stores'
import { getPendingClockRecords } from '@/lib/actions/clock-records'
import { redirect } from 'next/navigation'
import ClockRecordsApprovalComponent from '@/components/admin/ClockRecordsApprovalComponent'

export default async function ClockRecordsApprovalPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>
}) {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // 管理者権限チェック
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    redirect('/')
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
              打刻承認を行うには、まず企業に所属する必要があります。
            </p>
          </div>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const companyId = companies[0].company_id
  const { data: stores } = await getCompanyStores(companyId)
  const selectedStoreId = params.storeId ? parseInt(params.storeId) : stores?.[0]?.id

  // 選択された店舗の承認待ち打刻記録を取得
  const pendingRecords = selectedStoreId
    ? await getPendingClockRecords(selectedStoreId)
    : { data: [] }

  return (
    <ClockRecordsApprovalComponent
      user={user}
      stores={stores || []}
      selectedStoreId={selectedStoreId}
      pendingRecords={pendingRecords.data || []}
    />
  )
}





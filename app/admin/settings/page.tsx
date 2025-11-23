import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { getUserCompanies } from '@/lib/actions/auth'
import { getCompanyStores } from '@/lib/actions/stores'
import { getStoreSettings } from '@/lib/actions/store-settings'
import { redirect } from 'next/navigation'
import SettingsManagementComponent from '@/components/admin/SettingsManagementComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function SettingsManagementPage({
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
              設定を管理するには、まず企業に所属する必要があります。
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

  // 選択された店舗の設定を取得
  const settings = selectedStoreId ? await getStoreSettings(selectedStoreId) : { data: null }

  return (
    <SettingsManagementComponent
      user={user}
      stores={stores || []}
      selectedStoreId={selectedStoreId}
      settings={settings.data}
    />
  )
}





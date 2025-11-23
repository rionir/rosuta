import { getCurrentUser, isUserAdmin } from '@/lib/actions/auth'
import { getUserCompanies } from '@/lib/actions/auth'
import { getCompanyStores } from '@/lib/actions/stores'
import { redirect } from 'next/navigation'
import StoresManagementComponent from '@/components/admin/StoresManagementComponent'

// 認証が必要なページのため、動的レンダリングを明示
export const dynamic = 'force-dynamic'

export default async function StoresManagementPage() {
  const { data: user } = await getCurrentUser()

  if (!user) {
    redirect('/app/login')
  }

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
              店舗を管理するには、まず企業に所属する必要があります。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 最初の企業の店舗一覧を取得
  const companyId = companies[0].company_id
  const { data: stores } = await getCompanyStores(companyId)

  return (
    <StoresManagementComponent
      user={user}
      companyId={companyId}
      stores={stores || []}
    />
  )
}





'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateStoreSettings } from '@/lib/actions/store-settings'

interface SettingsManagementComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  stores: Array<{
    id: number
    name: string
    address?: string
  }>
  selectedStoreId?: number
  settings: {
    id: number
    store_id: number
    approval_required: boolean
  } | null
}

export default function SettingsManagementComponent({
  user,
  stores,
  selectedStoreId,
  settings: initialSettings,
}: SettingsManagementComponentProps) {
  const router = useRouter()
  const [selectedStore, setSelectedStore] = useState<number | undefined>(selectedStoreId)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvalRequired, setApprovalRequired] = useState(initialSettings?.approval_required || false)

  const handleStoreChange = (storeId: string) => {
    const newStoreId = storeId ? parseInt(storeId) : undefined
    setSelectedStore(newStoreId)
    const params = new URLSearchParams()
    if (newStoreId) params.set('storeId', newStoreId.toString())
    router.push(`/admin/settings?${params.toString()}`)
  }

  const handleUpdate = async (formData: FormData) => {
    if (!selectedStore) {
      setError('店舗を選択してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const approvalRequired = formData.get('approvalRequired') === 'true'

      const result = await updateStoreSettings({
        storeId: selectedStore,
        approvalRequired,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setApprovalRequired(approvalRequired)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">設定</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* 店舗選択 */}
      <div className="mb-6">
        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
          店舗を選択
        </label>
        <select
          id="store"
          value={selectedStore?.toString() || ''}
          onChange={(e) => handleStoreChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">店舗を選択</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* 設定フォーム */}
      {selectedStore && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">店舗設定</h2>
          </div>
          <form action={handleUpdate} className="p-8">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="approvalRequired"
                      name="approvalRequired"
                      type="checkbox"
                      value="true"
                      checked={approvalRequired}
                      onChange={(e) => setApprovalRequired(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="approvalRequired" className="font-medium text-gray-900">
                      打刻修正に承認を必要とする
                    </label>
                    <p className="text-gray-500 mt-1">
                      この設定をONにすると、スタッフが打刻を修正した際に管理者の承認が必要になります。
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '更新中...' : '設定を保存'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!selectedStore && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="p-8 text-center">
            <p className="text-gray-500">店舗を選択してください</p>
          </div>
        </div>
      )}
    </div>
  )
}





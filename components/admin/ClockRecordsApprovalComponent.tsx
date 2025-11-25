'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveClockRecord } from '@/lib/actions/clock-records'
import { formatUserName } from '@/lib/utils/user-name'

interface ClockRecordsApprovalComponentProps {
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
  pendingRecords: Array<{
    id: number
    user_id: string
    store_id: number
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
    selected_time: string
    actual_time: string
    method: 'scheduled' | 'current' | 'manual'
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    users: {
      id: string
      last_name: string
      first_name: string
    }
  }>
}

const typeLabels: Record<string, string> = {
  clock_in: '出勤',
  clock_out: '退勤',
  break_start: '休憩開始',
  break_end: '休憩終了',
}

const methodLabels: Record<string, string> = {
  scheduled: '予定時刻',
  current: '現在時刻',
  manual: '手動入力',
}

export default function ClockRecordsApprovalComponent({
  user,
  stores,
  selectedStoreId,
  pendingRecords: initialPendingRecords,
}: ClockRecordsApprovalComponentProps) {
  const router = useRouter()
  const [selectedStore, setSelectedStore] = useState<number | undefined>(selectedStoreId)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStoreChange = (storeId: string) => {
    const newStoreId = storeId ? parseInt(storeId) : undefined
    setSelectedStore(newStoreId)
    const params = new URLSearchParams()
    if (newStoreId) params.set('storeId', newStoreId.toString())
    router.push(`/app/admin/clock-records?${params.toString()}`)
  }

  const handleApprove = async (recordId: number, status: 'approved' | 'rejected') => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await approveClockRecord(recordId, status, user.id)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '承認処理に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">打刻承認</h1>
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

      {/* 承認待ちリスト */}
      {selectedStore ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">承認待ち打刻記録</h2>
          </div>
          <div className="p-8">
            {initialPendingRecords.length === 0 ? (
              <p className="text-gray-500">承認待ちの打刻記録はありません</p>
            ) : (
              <div className="space-y-4">
                {initialPendingRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{formatUserName(record.users)}</h3>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            {typeLabels[record.type]}
                          </span>
                          <span className="text-sm text-gray-500">{methodLabels[record.method]}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            選択時刻: {new Date(record.selected_time).toLocaleString('ja-JP')}
                          </p>
                          <p>
                            実際時刻: {new Date(record.actual_time).toLocaleString('ja-JP')}
                          </p>
                          <p className="text-xs text-gray-500">
                            申請日時: {new Date(record.created_at).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(record.id, 'approved')}
                          disabled={isLoading}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          承認
                        </button>
                        <button
                          onClick={() => handleApprove(record.id, 'rejected')}
                          disabled={isLoading}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          却下
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="p-8 text-center">
            <p className="text-gray-500">店舗を選択してください</p>
          </div>
        </div>
      )}
    </div>
  )
}





'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createShift, updateShift, deleteShift } from '@/lib/actions/shifts'
import { copyShifts } from '@/lib/actions/shift-copies'

interface ShiftsManagementComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  companyId: number
  stores: Array<{
    id: number
    name: string
    address?: string
  }>
  storeUsers: Array<{
    user_id: string
    users: {
      id: string
      name: string
    }
  }>
  shifts: Array<{
    id: number
    user_id: string
    store_id: number
    scheduled_start: string
    scheduled_end: string
    users: {
      id: string
      name: string
    }
  }>
  year: number
  month: number
  selectedStoreId?: number
}

export default function ShiftsManagementComponent({
  user,
  companyId,
  stores,
  storeUsers,
  shifts: initialShifts,
  year,
  month,
  selectedStoreId,
}: ShiftsManagementComponentProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<number | undefined>(selectedStoreId)

  const handleStoreChange = (storeId: string) => {
    const newStoreId = storeId ? parseInt(storeId) : undefined
    setSelectedStore(newStoreId)
    const params = new URLSearchParams()
    if (newStoreId) params.set('storeId', newStoreId.toString())
    params.set('year', year.toString())
    params.set('month', month.toString())
    router.push(`/admin/shifts?${params.toString()}`)
  }

  const handleCreate = async (formData: FormData) => {
    if (!selectedStore) {
      setError('店舗を選択してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userId = formData.get('userId') as string
      const date = formData.get('date') as string
      const scheduledStartTime = formData.get('scheduledStartTime') as string
      const scheduledEndTime = formData.get('scheduledEndTime') as string

      if (!userId || !date || !scheduledStartTime || !scheduledEndTime) {
        setError('すべての必須項目を入力してください')
        setIsLoading(false)
        return
      }

      // 日付と時刻を組み合わせてTIMESTAMPに変換（JSTとして解釈）
      // JST (UTC+9) として明示的に指定
      let scheduledStart = `${date}T${scheduledStartTime}:00+09:00`
      let scheduledEnd = `${date}T${scheduledEndTime}:00+09:00`
      
      // 夜勤の場合、終了日を翌日に設定
      const startDate = new Date(scheduledStart)
      const endDate = new Date(scheduledEnd)
      if (endDate < startDate) {
        // 翌日の日付を取得
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]
        scheduledEnd = `${nextDayStr}T${scheduledEndTime}:00+09:00`
      }

      // JSTのタイムゾーン情報（+09:00）を含めた文字列をそのまま送信
      // PostgreSQLが自動的にUTCに変換して保存するが、タイムゾーン情報は保持される
      const result = await createShift({
        userId,
        storeId: selectedStore,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
        createdBy: user.id,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsCreating(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シフトの作成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (shiftId: number, formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const date = formData.get('date') as string
      const scheduledStartTime = formData.get('scheduledStartTime') as string
      const scheduledEndTime = formData.get('scheduledEndTime') as string

      if (!date || !scheduledStartTime || !scheduledEndTime) {
        setError('すべての必須項目を入力してください')
        setIsLoading(false)
        return
      }

      // 日付と時刻を組み合わせてTIMESTAMPに変換（JSTとして解釈）
      // JST (UTC+9) として明示的に指定
      let scheduledStart = `${date}T${scheduledStartTime}:00+09:00`
      let scheduledEnd = `${date}T${scheduledEndTime}:00+09:00`
      
      // 夜勤の場合、終了日を翌日に設定
      const startDate = new Date(scheduledStart)
      const endDate = new Date(scheduledEnd)
      if (endDate < startDate) {
        // 翌日の日付を取得
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]
        scheduledEnd = `${nextDayStr}T${scheduledEndTime}:00+09:00`
      }

      // JSTのタイムゾーン情報（+09:00）を含めた文字列をそのまま送信
      // PostgreSQLが自動的にUTCに変換して保存するが、タイムゾーン情報は保持される
      const result = await updateShift({
        shiftId,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setEditingId(null)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シフトの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (shiftId: number) => {
    if (!confirm('このシフトを削除しますか？')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteShift(shiftId)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シフトの削除に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (formData: FormData) => {
    if (!selectedStore) {
      setError('店舗を選択してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const sourceDate = formData.get('sourceDate') as string
      const targetDate = formData.get('targetDate') as string
      const overwrite = formData.get('overwrite') === 'true'

      if (!sourceDate || !targetDate) {
        setError('コピー元とコピー先の日付を入力してください')
        setIsLoading(false)
        return
      }

      const result = await copyShifts({
        userId: user.id,
        sourceDate,
        targetDate,
        storeId: selectedStore,
        overwrite,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsCopying(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'シフトのコピーに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMonthChange = (delta: number) => {
    const newDate = new Date(year, month - 1 + delta, 1)
    const params = new URLSearchParams()
    if (selectedStore) params.set('storeId', selectedStore.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/admin/shifts?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">シフト管理</h1>
        <div className="flex space-x-3">
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              + シフトを追加
            </button>
          )}
          {!isCopying && (
            <button
              onClick={() => setIsCopying(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
            >
              シフトをコピー
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* 店舗選択・月選択 */}
      <div className="mb-6 flex items-center space-x-4">
        <select
          value={selectedStore?.toString() || ''}
          onChange={(e) => handleStoreChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-700">
            {year}年{month}月
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      {/* 新規作成フォーム */}
      {isCreating && selectedStore && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">新規シフト追加</h2>
          </div>
          <form action={handleCreate} className="p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  スタッフ <span className="text-red-500">*</span>
                </label>
                <select
                  id="userId"
                  name="userId"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">選択してください</option>
                  {storeUsers.map((su) => (
                    <option key={su.user_id} value={su.user_id}>
                      {su.users.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduledStartTime" className="block text-sm font-medium text-gray-700 mb-2">
                    開始時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="scheduledStartTime"
                    name="scheduledStartTime"
                    type="time"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="scheduledEndTime" className="block text-sm font-medium text-gray-700 mb-2">
                    終了時刻 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="scheduledEndTime"
                    name="scheduledEndTime"
                    type="time"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '作成中...' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setError(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* コピーフォーム */}
      {isCopying && selectedStore && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">シフトコピー</h2>
          </div>
          <form action={handleCopy} className="p-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sourceDate" className="block text-sm font-medium text-gray-700 mb-2">
                    コピー元の日付 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sourceDate"
                    name="sourceDate"
                    type="date"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                    コピー先の日付 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="targetDate"
                    name="targetDate"
                    type="date"
                    required
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="overwrite"
                  name="overwrite"
                  type="checkbox"
                  value="true"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-700">
                  既存シフトを上書きする
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'コピー中...' : 'コピー'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCopying(false)
                    setError(null)
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* シフト一覧 */}
      {selectedStore ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
          <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">シフト一覧</h2>
          </div>
          <div className="p-8">
            {initialShifts.length === 0 ? (
              <p className="text-gray-500">シフトが登録されていません</p>
            ) : (
              <div className="space-y-4">
                {initialShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    {editingId === shift.id ? (
                      <form
                        action={(formData) => handleUpdate(shift.id, formData)}
                        className="space-y-4"
                      >
                        <div>
                          <label htmlFor={`date-${shift.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            日付 <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={`date-${shift.id}`}
                            name="date"
                            type="date"
                            defaultValue={new Date(shift.scheduled_start).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                            required
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`scheduledStartTime-${shift.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              開始時刻 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`scheduledStartTime-${shift.id}`}
                              name="scheduledStartTime"
                              type="time"
                              defaultValue={new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })}
                              required
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          <div>
                            <label htmlFor={`scheduledEndTime-${shift.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              終了時刻 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`scheduledEndTime-${shift.id}`}
                              name="scheduledEndTime"
                              type="time"
                              defaultValue={new Date(shift.scheduled_end).toTimeString().split(' ')[0].substring(0, 5)}
                              required
                              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? '更新中...' : '更新'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setError(null)
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                          >
                            キャンセル
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{shift.users?.name || 'ユーザー不明'}</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {new Date(shift.scheduled_start).toLocaleDateString('ja-JP')} {new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingId(shift.id)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(shift.id)}
                            disabled={isLoading}
                            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )}
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


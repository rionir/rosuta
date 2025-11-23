'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAdminCalendarData, getUnclockedUsers } from '@/lib/actions/admin-calendar'

interface AdminCalendarComponentProps {
  user: {
    id: string
    email?: string
    profile?: {
      name: string
    }
  }
  stores: Array<{
    store_id: number
    company_stores: {
      id: number
      name: string
    }
  }>
  storeUsers: Array<{
    user_id: string
    users: {
      id: string
      name: string
    }
  }>
  year: number
  month: number
  selectedStoreId: number
  selectedUserId?: string
}

interface AdminCalendarDayData {
  date: string
  shifts: Array<{
    id: number
    date: string
    scheduled_start: string
    scheduled_end: string
    user_id: string
    users: {
      id: string
      name: string
    }
  }>
  clockRecords: Array<{
    id: number
    user_id: string
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
    selected_time: string
    actual_time: string
    method: 'scheduled' | 'current' | 'manual'
    status: 'pending' | 'approved' | 'rejected'
    users: {
      id: string
      name: string
    }
  }>
}

export default function AdminCalendarComponent({
  user,
  stores,
  storeUsers,
  year,
  month,
  selectedStoreId,
  selectedUserId,
}: AdminCalendarComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [calendarData, setCalendarData] = useState<AdminCalendarDayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [unclockedUsers, setUnclockedUsers] = useState<Array<{
    user_id: string
    name: string
    scheduled_start: string
    scheduled_end: string
  }>>([])

  useEffect(() => {
    async function loadCalendarData() {
      setIsLoading(true)
      try {
        const result = await getAdminCalendarData(
          selectedStoreId,
          year,
          month,
          selectedUserId
        )
        if (result.data) {
          setCalendarData(result.data)
        } else if (result.error) {
          console.error('カレンダーデータの取得エラー:', result.error)
        }
      } catch (error) {
        console.error('カレンダーデータの取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCalendarData()
  }, [selectedStoreId, year, month, selectedUserId])

  // 日付選択時に未打刻者リストを取得
  useEffect(() => {
    async function loadUnclockedUsers() {
      if (!selectedDate) {
        setUnclockedUsers([])
        return
      }

      try {
        const result = await getUnclockedUsers(selectedStoreId, selectedDate)
        if (result.data) {
          setUnclockedUsers(result.data)
        }
      } catch (error) {
        console.error('未打刻者リストの取得エラー:', error)
      }
    }
    loadUnclockedUsers()
  }, [selectedDate, selectedStoreId])

  // 月の日付を生成
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // 前月・次月のナビゲーション
  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 2, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/admin/calendar?${params.toString()}`)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/admin/calendar?${params.toString()}`)
  }

  const handleStoreChange = (storeId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('storeId', storeId.toString())
    params.delete('userId') // 店舗変更時はユーザーフィルターをリセット
    router.push(`/admin/calendar?${params.toString()}`)
  }

  const handleUserChange = (userId: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (userId) {
      params.set('userId', userId)
    } else {
      params.delete('userId')
    }
    router.push(`/admin/calendar?${params.toString()}`)
  }

  // 日付ごとのデータを取得
  const getDayData = (day: number): AdminCalendarDayData | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData.find((d) => d.date === dateStr)
  }

  // 日付の状態を判定（色分け用）
  const getDayStatus = (dayData: AdminCalendarDayData | undefined) => {
    if (!dayData) return 'none'

    const hasShifts = dayData.shifts.length > 0
    const hasClockRecords = dayData.clockRecords.length > 0

    if (hasShifts && hasClockRecords) return 'has_both'
    if (hasClockRecords) return 'has_records'
    if (hasShifts) return 'has_shifts'
    return 'none'
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* フィルター */}
      <div className="mb-6 space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            店舗選択
          </label>
          <select
            value={selectedStoreId}
            onChange={(e) => handleStoreChange(parseInt(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
          >
            {stores.map((store) => (
              <option key={store.store_id} value={store.store_id}>
                {store.company_stores.name}
              </option>
            ))}
          </select>
        </div>

        {storeUsers.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              スタッフ選択（個人別表示）
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => handleUserChange(e.target.value || undefined)}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
            >
              <option value="">すべてのスタッフ</option>
              {storeUsers.map((storeUser) => (
                <option key={storeUser.user_id} value={storeUser.user_id}>
                  {storeUser.users.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="border-b border-blue-100 bg-blue-50 px-8 py-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {year}年 {monthNames[month - 1]}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                ← 前月
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('year', today.getFullYear().toString())
                  params.set('month', (today.getMonth() + 1).toString())
                  router.push(`/admin/calendar?${params.toString()}`)
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                今月
              </button>
              <button
                onClick={handleNextMonth}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                次月 →
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* 曜日ヘッダー */}
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-semibold text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* 空白セル（月初め） */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* 日付セル */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayData = getDayData(day)
                const status = getDayStatus(dayData)
                const isToday =
                  new Date().getFullYear() === year &&
                  new Date().getMonth() + 1 === month &&
                  new Date().getDate() === day
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                    className={`min-h-[120px] cursor-pointer rounded-lg border-2 p-2 transition-all ${
                      isToday
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : status === 'has_both'
                        ? 'border-green-200 bg-green-50'
                        : status === 'has_records'
                        ? 'border-blue-200 bg-blue-50'
                        : status === 'has_shifts'
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-100 bg-white'
                    } ${selectedDate === dateStr ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`mb-1 text-sm font-semibold ${
                      isToday ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    {dayData && (
                      <div className="space-y-1">
                        {dayData.shifts.length > 0 && (
                          <div className="rounded bg-white/60 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                            📅 {dayData.shifts.length}件のシフト
                          </div>
                        )}
                        {dayData.clockRecords.length > 0 && (
                          <div className="rounded bg-white/60 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                            ⏰ {dayData.clockRecords.length}件の打刻
                          </div>
                        )}
                        {dayData.shifts.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {dayData.shifts.slice(0, 2).map((shift) => (
                              <div
                                key={shift.id}
                                className="truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-800"
                              >
                                {shift.users?.name || '不明'}: {shift.scheduled_start.substring(0, 5)}〜{shift.scheduled_end.substring(0, 5)}
                              </div>
                            ))}
                            {dayData.shifts.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayData.shifts.length - 2}件
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 未打刻者リスト */}
      {selectedDate && unclockedUsers.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-yellow-200">
          <div className="border-b border-yellow-200 bg-yellow-50 px-8 py-7">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {selectedDate} の未打刻者
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              {unclockedUsers.map((user) => (
                <li
                  key={user.user_id}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-sm text-gray-600">
                      予定: {user.scheduled_start.substring(0, 5)}〜{user.scheduled_end.substring(0, 5)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}


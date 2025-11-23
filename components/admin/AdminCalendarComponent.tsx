'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAdminCalendarData, getUnclockedUsers } from '@/lib/actions/admin-calendar'
import { formatUserName } from '@/lib/utils/user-name'

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
      last_name: string
      first_name: string
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
    scheduled_start: string
    scheduled_end: string
    user_id: string
    users: {
      id: string
      last_name: string
      first_name: string
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
      last_name: string
      first_name: string
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
  const [showTimeDetails, setShowTimeDetails] = useState(false)
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
          selectedUserId,
          storeUsers
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
  }, [selectedStoreId, year, month, selectedUserId, storeUsers])

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
  
  // 前月の最終日を計算
  const prevMonthLastDay = new Date(year, month - 1, 0)
  const prevMonthDays = prevMonthLastDay.getDate()
  
  // カレンダーに表示する全42日（6週間）を計算
  const totalDays = 42
  const daysToShow: Array<{
    day: number
    month: number
    year: number
    isCurrentMonth: boolean
  }> = []
  
  // 前月の日付を追加
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    daysToShow.push({
      day: prevMonthDays - i,
      month: month - 1,
      year: month === 1 ? year - 1 : year,
      isCurrentMonth: false,
    })
  }
  
  // 今月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    daysToShow.push({
      day,
      month,
      year,
      isCurrentMonth: true,
    })
  }
  
  // 次の月の日付を追加（42日になるまで）
  const remainingDays = totalDays - daysToShow.length
  for (let day = 1; day <= remainingDays; day++) {
    daysToShow.push({
      day,
      month: month + 1,
      year: month === 12 ? year + 1 : year,
      isCurrentMonth: false,
    })
  }

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


  // シフトの出勤状況を判定
  const getShiftStatus = (shift: AdminCalendarDayData['shifts'][0], clockRecords: AdminCalendarDayData['clockRecords'], dateStr: string) => {
    const dayRecords = clockRecords.filter(
      (record) => record.user_id === shift.user_id
    )

    const hasClockIn = dayRecords.some(
      (record) => record.type === 'clock_in' && record.status === 'approved'
    )
    const hasClockOut = dayRecords.some(
      (record) => record.type === 'clock_out' && record.status === 'approved'
    )
    const hasBreakStart = dayRecords.some(
      (record) => record.type === 'break_start' && record.status === 'approved'
    )
    const hasBreakEnd = dayRecords.some(
      (record) => record.type === 'break_end' && record.status === 'approved'
    )

    // 休憩中（break_startがあるがbreak_endがない）
    if (hasBreakStart && !hasBreakEnd) {
      return 'on_break'
    }

    // 退勤済み
    if (hasClockOut) {
      return 'clocked_out'
    }

    // 出勤済み
    if (hasClockIn) {
      return 'clocked_in'
    }

    // 開始時間が過ぎているかチェック
    const now = new Date()
    const shiftDateTime = new Date(shift.scheduled_start)
    
    // 開始時間が過ぎている && 出勤していない → 遅刻または未出勤
    if (now > shiftDateTime) {
      return 'late_or_not_clocked'
    }

    // 未出勤（開始時間前）
    return 'not_clocked'
  }

  // 出勤状況に応じた色を返す
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'clocked_out':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'late_or_not_clocked':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'not_clocked':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 lg:px-6">
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
                  {formatUserName(storeUser.users, { noSpace: true })}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
                aria-label="前月"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
                aria-label="次月"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {year}年 {monthNames[month - 1]}
            </h2>
              <button
                onClick={() => {
                  const today = new Date()
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('year', today.getFullYear().toString())
                  params.set('month', (today.getMonth() + 1).toString())
                  router.push(`/admin/calendar?${params.toString()}`)
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700"
              >
                今日
              </button>
            </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  詳細
                </label>
                <button
                  type="button"
                  onClick={() => setShowTimeDetails(!showTimeDetails)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    showTimeDetails ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      showTimeDetails ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-0 border border-gray-100 rounded-b-2xl overflow-hidden">
              {/* 曜日ヘッダー */}
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-xs font-medium text-gray-600 border-b border-gray-100"
                >
                  {day}
                </div>
              ))}

              {/* 日付セル（前月・今月・次月を含む） */}
              {daysToShow.map((dateInfo, i) => {
                const dateStr = `${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`
                const dayData = dateInfo.isCurrentMonth ? calendarData.find((d) => d.date === dateStr) : null
                const isToday =
                  new Date().getFullYear() === dateInfo.year &&
                  new Date().getMonth() + 1 === dateInfo.month &&
                  new Date().getDate() === dateInfo.day

                // シフトを開始時間順でソート
                const sortedShifts = dayData
                  ? [...dayData.shifts].sort((a, b) => {
                      return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
                    })
                  : []

                // シフトがないが打刻記録があるユーザーを抽出
                const clockRecordsWithoutShift: Array<{
                  user_id: string
                  users: { id: string; last_name: string; first_name: string } | null
                  clock_in_time?: string
                }> = []
                
                if (dayData && dayData.clockRecords.length > 0) {
                  const shiftUserIds = new Set(dayData.shifts.map((s) => s.user_id))
                  const clockInRecords = dayData.clockRecords.filter(
                    (r) => r.type === 'clock_in' && r.status === 'approved' && !shiftUserIds.has(r.user_id)
                  )
                  
                  // ユーザーごとに最初の出勤時刻を取得
                  const userClockInMap = new Map<string, string>()
                  clockInRecords.forEach((record) => {
                    if (!userClockInMap.has(record.user_id)) {
                      userClockInMap.set(record.user_id, record.selected_time)
                    }
                  })
                  
                  userClockInMap.forEach((clockInTime, userId) => {
                    const record = clockInRecords.find((r) => r.user_id === userId)
                    if (record) {
                      clockRecordsWithoutShift.push({
                        user_id: userId,
                        users: record.users,
                        clock_in_time: clockInTime,
                      })
                    }
                  })
                }

                const hasData = (sortedShifts.length > 0 || clockRecordsWithoutShift.length > 0)

                return (
                  <div
                    key={`${dateInfo.year}-${dateInfo.month}-${dateInfo.day}-${i}`}
                    onClick={() => {
                      if (dateInfo.isCurrentMonth) {
                        setSelectedDate(selectedDate === dateStr ? null : dateStr)
                      }
                    }}
                    className={`min-h-[90px] border-r border-b border-gray-100 p-0.5 transition-all ${
                      !dateInfo.isCurrentMonth
                        ? 'bg-gray-50'
                        : isToday
                        ? 'bg-blue-50'
                        : 'bg-white'
                    } ${dateInfo.isCurrentMonth && selectedDate === dateStr ? 'ring-2 ring-blue-500 ring-inset' : ''} ${
                      dateInfo.isCurrentMonth ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className={`mb-0.5 px-1 text-xs font-medium ${
                      !dateInfo.isCurrentMonth
                        ? 'text-gray-400'
                        : isToday
                        ? 'text-blue-700 font-semibold'
                        : 'text-gray-900'
                    }`}>
                      {dateInfo.day}
                    </div>
                    {dayData && hasData && (
                      <div className="flex flex-col gap-0.5 px-0.5">
                        {/* シフトがあるユーザー */}
                        {sortedShifts.map((shift) => {
                          const status = getShiftStatus(shift, dayData.clockRecords, dateStr)
                          const statusColor = getStatusColor(status)
                          return (
                            <div
                              key={shift.id}
                              className={`w-full rounded px-1 py-0.5 text-xs font-medium ${statusColor}`}
                            >
                              <span className="block whitespace-normal break-words">
                                {showTimeDetails
                                  ? `${shift.users ? formatUserName(shift.users, { noSpace: true }) : '不明'} ${new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}-${new Date(shift.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
                                  : shift.users ? formatUserName(shift.users, { noSpace: true }) : '不明'}
                              </span>
                            </div>
                          )
                        })}
                        {/* シフトがないが打刻記録があるユーザー */}
                        {clockRecordsWithoutShift.map((record) => {
                          const clockInTime = record.clock_in_time
                            ? new Date(record.clock_in_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                            : ''
                          return (
                            <div
                              key={`no-shift-${record.user_id}`}
                              className="w-full rounded px-1 py-0.5 text-xs font-medium bg-green-100 text-green-800 border-green-200"
                            >
                              <span className="block whitespace-normal break-words">
                                {showTimeDetails && clockInTime
                                  ? `${record.users ? formatUserName(record.users, { noSpace: true }) : '不明'} ${clockInTime}`
                                  : record.users ? formatUserName(record.users, { noSpace: true }) : '不明'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
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
                      予定: {new Date(user.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜{new Date(user.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
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


'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCalendarData } from '@/lib/actions/calendar'
import CalendarStoreSelect from './StoreSelect'

interface CalendarComponentProps {
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
  year: number
  month: number
  selectedStoreId?: number
}

interface CalendarDayData {
  date: string
  shifts: Array<{
    id: number
    scheduled_start: string
    scheduled_end: string
    store_id: number
    company_stores: {
      id: number
      name: string
    }
  }>
  clockRecords: Array<{
    id: number
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
    selected_time: string
    actual_time: string
    method: 'scheduled' | 'current' | 'manual'
    status: 'pending' | 'approved' | 'rejected'
    store_id: number
    company_stores: {
      id: number
      name: string
    }
  }>
}

export default function CalendarComponent({
  user,
  stores,
  year,
  month,
  selectedStoreId,
}: CalendarComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCalendarData() {
      setIsLoading(true)
      try {
        const result = await getCalendarData(user.id, year, month, selectedStoreId)
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
  }, [user.id, year, month, selectedStoreId])

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
    router.push(`/shifts?${params.toString()}`)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/shifts?${params.toString()}`)
  }

  // 日付ごとのデータを取得
  const getDayData = (day: number): CalendarDayData | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData.find((d) => d.date === dateStr)
  }

  // 日付の状態を判定（色分け用）
  const getDayStatus = (dayData: CalendarDayData | undefined) => {
    if (!dayData) return 'none'
    
    const hasShift = dayData.shifts.length > 0
    const hasClockIn = dayData.clockRecords.some((r) => r.type === 'clock_in' && r.status === 'approved')
    const hasClockOut = dayData.clockRecords.some((r) => r.type === 'clock_out' && r.status === 'approved')
    
    if (hasClockIn && hasClockOut) return 'completed'
    if (hasClockIn) return 'working'
    if (hasShift) return 'scheduled'
    return 'none'
  }

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <CalendarStoreSelect stores={stores} selectedStoreId={selectedStoreId} />
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
                  router.push(`/shifts?${params.toString()}`)
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

                return (
                  <div
                    key={day}
                    className={`min-h-[100px] rounded-lg border-2 p-2 transition-all ${
                      isToday
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : status === 'working'
                        ? 'border-blue-200 bg-blue-50'
                        : status === 'scheduled'
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-100 bg-white'
                    }`}
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
                            📅 {new Date(dayData.shifts[0].scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                            {new Date(dayData.shifts[0].scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            {dayData.shifts[0].company_stores && (
                              <span className="ml-1 text-gray-500">
                                ({dayData.shifts[0].company_stores.name})
                              </span>
                            )}
                          </div>
                        )}
                        {dayData.clockRecords
                          .filter((r) => r.status === 'approved' || r.status === 'pending')
                          .sort((a, b) => a.selected_time.localeCompare(b.selected_time))
                          .map((record) => (
                            <div
                              key={record.id}
                              className={`rounded px-1.5 py-0.5 text-xs ${
                                record.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : record.type === 'clock_in'
                                  ? 'bg-blue-100 text-blue-800'
                                  : record.type === 'clock_out'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {record.type === 'clock_in' && '⏰ 出勤'}
                              {record.type === 'clock_out' && '🏠 退勤'}
                              {record.type === 'break_start' && '☕ 休憩開始'}
                              {record.type === 'break_end' && '⏰ 休憩終了'}
                              {record.status === 'pending' && ' (承認待ち)'}
                              <span className="ml-1 text-gray-600">
                                {record.selected_time.substring(11, 16)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


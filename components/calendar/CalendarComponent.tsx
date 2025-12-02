'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCalendarData } from '@/presentation/calendar/actions/calendar'
import CalendarStoreSelect from './StoreSelect'
import { UserStoreWithStoreDTO } from '@/presentation/store/dto/store-dto'

import { CurrentUserDTO } from '@/presentation/auth/dto/current-user-dto'

interface CalendarComponentProps {
  user: CurrentUserDTO
  stores: UserStoreWithStoreDTO[]
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
    shift_breaks?: Array<{
      id: number
      break_start: string
      break_end: string
    }>
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
    router.push(`/app/shifts?${params.toString()}`)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 1)
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', newDate.getFullYear().toString())
    params.set('month', (newDate.getMonth() + 1).toString())
    router.push(`/app/shifts?${params.toString()}`)
  }

  // 日付ごとのデータを取得
  const getDayData = (day: number, targetMonth: number, targetYear: number): CalendarDayData | undefined => {
    const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData.find((d) => d.date === dateStr)
  }

  // 休憩時間を計算（分単位）
  const calculateBreakMinutes = (breaks: Array<{ break_start: string; break_end: string }> | undefined): number => {
    if (!breaks || breaks.length === 0) return 0
    
    let totalMinutes = 0
    breaks.forEach((b) => {
      const start = new Date(b.break_start)
      const end = new Date(b.break_end)
      totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60)
    })
    return totalMinutes
  }

  // 実労時間を計算（分単位）
  const calculateActualWorkMinutes = (clockRecords: CalendarDayData['clockRecords']): { workMinutes: number; clockInTime: Date | null; clockOutTime: Date | null } => {
    const approvedRecords = clockRecords.filter((r) => r.status === 'approved')
    const sorted = approvedRecords.sort((a, b) => a.selected_time.localeCompare(b.selected_time))
    
    let clockInTime: Date | null = null
    let clockOutTime: Date | null = null
    let breakStartTime: Date | null = null
    let breakMinutes = 0
    
    sorted.forEach((record) => {
      const time = new Date(record.selected_time)
      
      switch (record.type) {
        case 'clock_in':
          clockInTime = time
          break
        case 'clock_out':
          clockOutTime = time
          break
        case 'break_start':
          breakStartTime = time
          break
        case 'break_end':
          if (breakStartTime) {
            breakMinutes += (time.getTime() - breakStartTime.getTime()) / (1000 * 60)
            breakStartTime = null
          }
          break
      }
    })
    
    if (clockInTime !== null && clockOutTime !== null) {
      const workMinutes = ((clockOutTime as Date).getTime() - (clockInTime as Date).getTime()) / (1000 * 60) - breakMinutes
      return { workMinutes, clockInTime, clockOutTime }
    }
    
    return { workMinutes: 0, clockInTime, clockOutTime }
  }

  // 時間を「〇h〇m」形式にフォーマット
  const formatWorkTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours === 0) {
      return `${mins}m`
    }
    if (mins === 0) {
      return `${hours}h`
    }
    return `${hours}h${mins}m`
  }

  // 日付の状態を判定（色分け用）
  const getDayStatus = (dayData: CalendarDayData | undefined, dateStr: string): 'future' | 'working' | 'completed' | 'missing_clock_in' | 'missing_clock_out' | 'none' => {
    if (!dayData || dayData.shifts.length === 0) return 'none'
    
    const shift = dayData.shifts[0]
    const now = new Date()
    const shiftStart = new Date(shift.scheduled_start)
    const shiftEnd = new Date(shift.scheduled_end)
    const date = new Date(dateStr)
    
    const hasClockIn = dayData.clockRecords.some((r) => r.type === 'clock_in' && r.status === 'approved')
    const hasClockOut = dayData.clockRecords.some((r) => r.type === 'clock_out' && r.status === 'approved')
    
    // 今日の日付を取得（時刻を00:00:00に設定）
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // 過去の日付
    if (targetDate < today) {
      if (hasClockIn && hasClockOut) {
        return 'completed'
      }
      if (hasClockIn && !hasClockOut) {
        return 'missing_clock_out'
      }
      if (!hasClockIn && now > shiftStart) {
        return 'missing_clock_in'
      }
      // 過去の日付でシフトがあるが打刻がない場合も未来として扱う（既に過ぎた場合はmissing_clock_in）
      return 'future'
    }
    
    // 未来の日付
    if (targetDate > today) {
      return 'future'
    }
    
    // 今日
    if (hasClockIn && hasClockOut) {
      return 'completed'
    }
    if (hasClockIn && !hasClockOut) {
      // 退勤予定時間を過ぎているかチェック
      if (now > shiftEnd) {
        return 'missing_clock_out'
      }
      return 'working'
    }
    if (!hasClockIn && now > shiftStart) {
      return 'missing_clock_in'
    }
    if (!hasClockIn) {
      return 'future'
    }
    
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                aria-label="前月"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                aria-label="次月"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight dark:text-gray-100">
                {year}年 {monthNames[month - 1]}
              </h2>
              <button
                onClick={() => {
                  const today = new Date()
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('year', today.getFullYear().toString())
                  params.set('month', (today.getMonth() + 1).toString())
                  router.push(`/app/shifts?${params.toString()}`)
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-blue-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100"
              >
                今日
              </button>
            </div>
          </div>
        </div>

        <div className="p-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-0 border border-gray-100 rounded-b-2xl overflow-hidden dark:border-gray-700">
              {/* 曜日ヘッダー */}
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-xs font-medium text-gray-600 border-b border-gray-100 dark:text-gray-400 dark:border-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* 日付セル（前月・今月・次月を含む） */}
              {daysToShow.map((dateInfo, i) => {
                const dateStr = `${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`
                const dayData = dateInfo.isCurrentMonth ? getDayData(dateInfo.day, dateInfo.month, dateInfo.year) : null
                const status = dayData ? getDayStatus(dayData, dateStr) : 'none'
                const isToday =
                  new Date().getFullYear() === dateInfo.year &&
                  new Date().getMonth() + 1 === dateInfo.month &&
                  new Date().getDate() === dateInfo.day

                // シフト情報を取得
                const shift = dayData?.shifts[0]
                const shiftBreaks = shift?.shift_breaks || []
                
                // 打刻記録から実労時間を計算
                const workTimeResult = dayData
                  ? calculateActualWorkMinutes(dayData.clockRecords)
                  : { workMinutes: 0, clockInTime: null as Date | null, clockOutTime: null as Date | null }
                const { workMinutes, clockInTime, clockOutTime } = workTimeResult

                // 予定時間を計算（休憩を除く）
                let scheduledWorkMinutes = 0
                if (shift) {
                  const shiftStart = new Date(shift.scheduled_start)
                  const shiftEnd = new Date(shift.scheduled_end)
                  const totalMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60)
                  const breakMinutes = calculateBreakMinutes(shiftBreaks)
                  scheduledWorkMinutes = totalMinutes - breakMinutes
                }

                // ステータスに応じた色を決定
                const getStatusColor = () => {
                  switch (status) {
                    case 'future':
                      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                    case 'working':
                      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                    case 'completed':
                      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                    case 'missing_clock_in':
                    case 'missing_clock_out':
                      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                    default:
                      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                  }
                }

                return (
                  <div
                    key={`${dateInfo.year}-${dateInfo.month}-${dateInfo.day}-${i}`}
                    className={`min-h-[90px] border-r border-b border-gray-100 p-0.5 transition-all dark:border-gray-700 ${
                      !dateInfo.isCurrentMonth
                        ? 'bg-gray-50 dark:bg-gray-900'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className={`mb-0.5 px-1 text-xs font-medium ${
                      !dateInfo.isCurrentMonth
                        ? 'text-gray-400 dark:text-gray-600'
                        : isToday
                        ? 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-semibold dark:bg-blue-500'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {dateInfo.day}
                    </div>
                    {dayData && shift && (
                      <div className="flex flex-col gap-0.5 px-0.5">
                        {status === 'future' && (
                          // 未来の予定：シフト時間と実労時間（休憩除く）
                          <div className={`w-full rounded px-1 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                            <span className="block whitespace-normal break-words">
                              {new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                              {new Date(shift.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                              <span className="ml-1 text-xs">
                                ({formatWorkTime(scheduledWorkMinutes)})
                              </span>
                              {shift.company_stores && (
                                <span className="ml-1 text-xs opacity-80">
                                  {shift.company_stores.name}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {status === 'working' && (
                          // 勤務中：シフトの予定時間（色を変える）
                          <div className={`w-full rounded px-1 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                            <span className="block whitespace-normal break-words">
                              {new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                              {new Date(shift.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                              <span className="ml-1 text-xs">
                                ({formatWorkTime(scheduledWorkMinutes)})
                              </span>
                              {shift.company_stores && (
                                <span className="ml-1 text-xs opacity-80">
                                  {shift.company_stores.name}
                              </span>
                            )}
                            </span>
                          </div>
                        )}
                        {status === 'completed' && (
                          // 過去で退勤済み：実際の出勤時間〜退勤時間と実労時間
                          clockInTime && clockOutTime && (
                            <div className={`w-full rounded px-1 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                              <span className="block whitespace-normal break-words">
                                {clockInTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                                {clockOutTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                <span className="ml-1 text-xs">
                                  ({formatWorkTime(workMinutes)})
                                </span>
                                {shift.company_stores && (
                                  <span className="ml-1 text-xs opacity-80">
                                    {shift.company_stores.name}
                                  </span>
                                )}
                              </span>
                            </div>
                          )
                        )}
                        {(status === 'missing_clock_in' || status === 'missing_clock_out') && (
                          // 打刻忘れ：警告色で表示
                          <div className={`w-full rounded px-1 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                            <span className="block whitespace-normal break-words">
                              {status === 'missing_clock_in' && '出勤打刻なし'}
                              {status === 'missing_clock_out' && '退勤打刻なし'}
                              {shift && (
                                <>
                                  <br />
                                  {new Date(shift.scheduled_start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜
                                  {new Date(shift.scheduled_end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                  {shift.company_stores && (
                                    <span className="ml-1 text-xs opacity-80">
                                      {shift.company_stores.name}
                                    </span>
                                  )}
                                </>
                              )}
                            </span>
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
    </div>
  )
}


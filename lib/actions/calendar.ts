'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserShifts } from './shifts'
import { getUserClockRecords } from './clock-records'

export interface CalendarDayData {
  date: string
  shifts: Array<{
    id: number
    date: string
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

/**
 * カレンダー表示用のデータを取得（シフト + 打刻記録）
 */
export async function getCalendarData(
  userId: string,
  year: number,
  month: number,
  storeId?: number
) {
  // 月の開始日と終了日を計算
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // 月の最後の日

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // シフトと打刻記録を並列取得
  const [shiftsResult, clockRecordsResult] = await Promise.all([
    getUserShifts(userId, startDateStr, endDateStr, storeId),
    getUserClockRecords(userId, `${startDateStr}T00:00:00`, `${endDateStr}T23:59:59`, storeId),
  ])

  if (shiftsResult.error) {
    return { error: shiftsResult.error }
  }

  if (clockRecordsResult.error) {
    return { error: clockRecordsResult.error }
  }

  const shifts = shiftsResult.data || []
  const clockRecords = clockRecordsResult.data || []

  // 日付ごとにデータをグループ化
  const calendarData: Record<string, CalendarDayData> = {}

  // シフトを日付ごとにグループ化（scheduled_startから日付を抽出）
  shifts.forEach((shift) => {
    const date = new Date(shift.scheduled_start).toISOString().split('T')[0]
    if (!calendarData[date]) {
      calendarData[date] = {
        date,
        shifts: [],
        clockRecords: [],
      }
    }
    calendarData[date].shifts.push(shift)
  })

  // 打刻記録を日付ごとにグループ化
  clockRecords.forEach((record) => {
    const date = record.selected_time.split('T')[0]
    if (!calendarData[date]) {
      calendarData[date] = {
        date,
        shifts: [],
        clockRecords: [],
      }
    }
    calendarData[date].clockRecords.push(record)
  })

  return { data: Object.values(calendarData) }
}


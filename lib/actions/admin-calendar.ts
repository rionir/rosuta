'use server'

import { createClient } from '@/lib/supabase/server'
import { getStoreShifts } from './shifts'
import { getStoreClockRecords } from './clock-records'

export interface AdminCalendarDayData {
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
      name?: string
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
      name?: string
    }
  }>
}

export interface UnclockedUser {
  user_id: string
  name: string
  scheduled_start: string
  scheduled_end: string
}

/**
 * 管理者向けカレンダー表示用のデータを取得（店舗のシフト + 打刻記録）
 */
export async function getAdminCalendarData(
  storeId: number,
  year: number,
  month: number,
  userId?: string,
  storeUsers?: Array<{ user_id: string; users: { id: string; last_name: string; first_name: string } | null }>
) {
  // 月の開始日と終了日を計算
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // 月の最後の日

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // シフトと打刻記録を並列取得
  const [shiftsResult, clockRecordsResult] = await Promise.all([
    getStoreShifts(storeId, startDateStr, endDateStr),
    getStoreClockRecords(storeId, `${startDateStr}T00:00:00`, `${endDateStr}T23:59:59`),
  ])

  if (shiftsResult.error) {
    return { error: shiftsResult.error }
  }

  if (clockRecordsResult.error) {
    return { error: clockRecordsResult.error }
  }

  let shifts = shiftsResult.data || []
  let clockRecords = clockRecordsResult.data || []

  // ユーザー情報をマップに変換（storeUsersから取得）
  const userMap = new Map<string, { id: string; last_name: string; first_name: string }>()
  if (storeUsers) {
    storeUsers.forEach((item) => {
      const userInfo = item.users && !Array.isArray(item.users) ? item.users : null
      if (userInfo && userInfo.id && userInfo.last_name) {
        userMap.set(item.user_id, { 
          id: userInfo.id, 
          last_name: userInfo.last_name,
          first_name: userInfo.first_name
        })
      }
    })
  }

  // シフトデータにユーザー情報をマージ
  shifts = shifts.map((shift: any) => {
    const userInfo = userMap.get(shift.user_id)
    return {
      ...shift,
      users: userInfo || null,
    }
  })

  // 打刻記録データにユーザー情報をマージ
  clockRecords = clockRecords.map((record: any) => {
    const userInfo = userMap.get(record.user_id)
    return {
      ...record,
      users: userInfo || null,
    }
  })

  // 特定ユーザーでフィルター
  if (userId) {
    shifts = shifts.filter((shift) => shift.user_id === userId)
    clockRecords = clockRecords.filter((record) => record.user_id === userId)
  }

  // 日付ごとにデータをグループ化
  const calendarData: Record<string, AdminCalendarDayData> = {}

  // シフトを日付ごとにグループ化（scheduled_startから日付を抽出）
  shifts.forEach((shift) => {
    // scheduled_startはTIMESTAMP型なので、日付部分を抽出
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

/**
 * 未打刻者リストを取得（指定日のシフトがあるが打刻がないユーザー）
 */
export async function getUnclockedUsers(
  storeId: number,
  date: string
) {
  const supabase = await createClient()

  // 指定日のシフトを取得
  // 外部キーを明示的に指定（user_idを使用）
  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select(`
      *,
      users!shifts_user_id_fkey (
        id,
        name
      )
    `)
    .eq('store_id', storeId)
    .gte('scheduled_start', `${date}T00:00:00`)
    .lte('scheduled_start', `${date}T23:59:59`)

  if (shiftsError) {
    return { error: shiftsError.message }
  }

  if (!shifts || shifts.length === 0) {
    return { data: [] }
  }

  // 指定日の打刻記録を取得（出勤のみ）
  const { data: clockRecords, error: clockError } = await supabase
    .from('clock_records')
    .select('user_id')
    .eq('store_id', storeId)
    .eq('type', 'clock_in')
    .gte('selected_time', `${date}T00:00:00`)
    .lte('selected_time', `${date}T23:59:59`)
    .eq('status', 'approved')

  if (clockError) {
    return { error: clockError.message }
  }

  // 打刻済みユーザーIDのセットを作成
  const clockedUserIds = new Set(
    (clockRecords || []).map((record) => record.user_id)
  )

  // シフトがあるが打刻がないユーザーを抽出
  const unclockedUsers: UnclockedUser[] = shifts
    .filter((shift) => !clockedUserIds.has(shift.user_id))
    .map((shift) => ({
      user_id: shift.user_id,
      name: shift.users ? `${shift.users.last_name}${shift.users.first_name}`.trim() || '不明' : '不明',
      // scheduled_startとscheduled_endはTIMESTAMP型なので、そのまま使用
      scheduled_start: shift.scheduled_start,
      scheduled_end: shift.scheduled_end,
    }))

  return { data: unclockedUsers }
}


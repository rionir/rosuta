import { getStoreShifts } from '@/presentation/shift/actions/shifts'
import { getStoreClockRecords } from '@/presentation/clock-record/actions/clock-records'
import { createClient } from '@/lib/supabase/server'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'
import { ShiftDTO } from '@/presentation/shift/dto/shift-dto'

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
    } | null
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
    } | null
  }>
}

export interface UnclockedUser {
  user_id: string
  name: string
  scheduled_start: string
  scheduled_end: string
}

/**
 * GetAdminCalendarDataUseCase
 * 管理者向けカレンダー表示用のデータを取得するユースケース（店舗のシフト + 打刻記録）
 */
export class GetAdminCalendarDataUseCase {
  async execute(
    storeId: number,
    year: number,
    month: number,
    userId?: string,
    storeUsers?: Array<{
      user_id: string
      users: { id: string; last_name: string; first_name: string } | null
    }>
  ): Promise<Result<AdminCalendarDayData[]>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      if (!year || year < 2000 || year > 2100) {
        return R.failure(
          new ValidationError('年が無効です', 'year')
        )
      }

      if (!month || month < 1 || month > 12) {
        return R.failure(
          new ValidationError('月が無効です', 'month')
        )
      }

      // 月の開始日と終了日を計算
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0) // 月の最後の日

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // シフトと打刻記録を並列取得
      const [shiftsResult, clockRecordsResult] = await Promise.all([
        getStoreShifts(storeId, startDateStr, endDateStr),
        getStoreClockRecords(
          storeId,
          `${startDateStr}T00:00:00`,
          `${endDateStr}T23:59:59`
        ),
      ])

      if ('error' in shiftsResult) {
        return R.failure(
          new ExternalServiceError('Shift Service', shiftsResult.error ?? 'シフトの取得に失敗しました')
        )
      }

      if ('error' in clockRecordsResult) {
        return R.failure(
          new ExternalServiceError('ClockRecord Service', clockRecordsResult.error ?? '打刻記録の取得に失敗しました')
        )
      }

      const shifts = shiftsResult.data || []
      let clockRecords = clockRecordsResult.data || []

      // ユーザー情報をマップに変換（storeUsersから取得）
      const userMap = new Map<
        string,
        { id: string; last_name: string; first_name: string }
      >()
      if (storeUsers) {
        storeUsers.forEach((item) => {
          const userInfo =
            item.users && !Array.isArray(item.users) ? item.users : null
          if (userInfo && userInfo.id && userInfo.last_name) {
            userMap.set(item.user_id, {
              id: userInfo.id,
              last_name: userInfo.last_name,
              first_name: userInfo.first_name,
            })
          }
        })
      }

      // シフトデータにユーザー情報をマージ
      type ShiftWithUser = ShiftDTO & { users: { id: string; last_name: string; first_name: string } | null }
      const shiftsWithUsers: ShiftWithUser[] = shifts.map((shift) => {
        const userInfo = userMap.get(shift.user_id)
        return {
          ...shift,
          users: userInfo || null,
        }
      })
      let shiftsTyped: ShiftWithUser[] = shiftsWithUsers

      // 打刻記録データにユーザー情報をマージ
      clockRecords = clockRecords.map((record) => {
        // usersが配列の場合、最初の要素を取得（1対1の関係なので）
        const recordUser = Array.isArray(record.users)
          ? record.users[0]
          : record.users
        const userInfo = userMap.get(record.user_id) || recordUser
        return {
          ...record,
          users: userInfo || null,
        }
      })

      // 特定ユーザーでフィルター
      if (userId) {
        shiftsTyped = shiftsTyped.filter((shift) => shift.user_id === userId)
        clockRecords = clockRecords.filter(
          (record) => record.user_id === userId
        )
      }

      // 日付ごとにデータをグループ化
      const calendarData: Record<string, AdminCalendarDayData> = {}

      // シフトを日付ごとにグループ化（scheduled_startから日付を抽出）
      shiftsTyped.forEach((shift) => {
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

      return R.success(Object.values(calendarData))
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '管理者カレンダーデータの取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}

/**
 * GetUnclockedUsersUseCase
 * 未打刻者リストを取得するユースケース（指定日のシフトがあるが打刻がないユーザー）
 */
export class GetUnclockedUsersUseCase {
  async execute(
    storeId: number,
    date: string
  ): Promise<Result<UnclockedUser[]>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      if (!date) {
        return R.failure(
          new ValidationError('日付が指定されていません', 'date')
        )
      }

      const supabase = await createClient()

      // 指定日のシフトを取得
      // 外部キーを明示的に指定（user_idを使用）
      const { data: shifts, error: shiftsError } = await supabase
        .from('shifts')
        .select(`
          *,
          users!shifts_user_id_fkey (
            id,
            last_name,
            first_name
          )
        `)
        .eq('store_id', storeId)
        .gte('scheduled_start', `${date}T00:00:00`)
        .lte('scheduled_start', `${date}T23:59:59`)

      if (shiftsError) {
        return R.failure(
          new ExternalServiceError('Supabase', `シフトの取得に失敗しました: ${shiftsError.message}`)
        )
      }

      if (!shifts || shifts.length === 0) {
        return R.success([])
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
        return R.failure(
          new ExternalServiceError('Supabase', `打刻記録の取得に失敗しました: ${clockError.message}`)
        )
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
          name: shift.users
            ? `${shift.users.last_name}${shift.users.first_name}`.trim() ||
              '不明'
            : '不明',
          // scheduled_startとscheduled_endはTIMESTAMP型なので、そのまま使用
          scheduled_start: shift.scheduled_start,
          scheduled_end: shift.scheduled_end,
        }))

      return R.success(unclockedUsers)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '未打刻者リストの取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


import { getUserShifts } from '@/presentation/shift/actions/shifts'
import { getUserClockRecords } from '@/presentation/clock-record/actions/clock-records'
import { getUserStores } from '@/presentation/store/actions/user-stores'
import { createClient } from '@/lib/supabase/server'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

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

/**
 * GetCalendarDataUseCase
 * カレンダー表示用のデータを取得するユースケース（シフト + 打刻記録）
 */
export class GetCalendarDataUseCase {
  async execute(
    userId: string,
    year: number,
    month: number,
    storeId?: number
  ): Promise<Result<CalendarDayData[]>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
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
        getUserShifts(userId, startDateStr, endDateStr, storeId),
        getUserClockRecords(
          userId,
          `${startDateStr}T00:00:00`,
          `${endDateStr}T23:59:59`,
          storeId
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
      const clockRecords = clockRecordsResult.data || []

      // ユーザーの店舗情報を取得（company_stores情報のため）
      const userStoresResult = await getUserStores(userId)
      const userStores = userStoresResult.data || []
      const storeMap = new Map<number, { id: number; name: string }>()
      userStores.forEach((us) => {
        if (us.company_stores) {
          storeMap.set(us.store_id, {
            id: us.company_stores.id,
            name: us.company_stores.name,
          })
        }
      })

      // シフトの休憩情報を取得
      const shiftIds = shifts.map((s) => s.id)
      const breaksByShiftId: Record<
        number,
        Array<{ id: number; break_start: string; break_end: string }>
      > = {}

      if (shiftIds.length > 0) {
        const supabase = await createClient()
        const { data: breaks } = await supabase
          .from('shift_breaks')
          .select('id, shift_id, break_start, break_end')
          .in('shift_id', shiftIds)
          .order('break_start', { ascending: true })

        if (breaks) {
          breaks.forEach((b) => {
            if (!breaksByShiftId[b.shift_id]) {
              breaksByShiftId[b.shift_id] = []
            }
            breaksByShiftId[b.shift_id].push({
              id: b.id,
              break_start: b.break_start,
              break_end: b.break_end,
            })
          })
        }
      }

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
        const storeInfo = storeMap.get(shift.store_id) || { id: shift.store_id, name: '不明' }
        calendarData[date].shifts.push({
          ...shift,
          date,
          company_stores: storeInfo,
          shift_breaks: breaksByShiftId[shift.id] || [],
        })
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
        const storeInfo = storeMap.get(record.store_id) || { id: record.store_id, name: '不明' }
        calendarData[date].clockRecords.push({
          ...record,
          company_stores: storeInfo,
        })
      })

      return R.success(Object.values(calendarData))
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'カレンダーデータの取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


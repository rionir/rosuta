import { getUserShifts } from '@/presentation/shift/actions/shifts'
import { getUserClockRecords } from '@/presentation/clock-record/actions/clock-records'
import { getStoreShifts } from '@/presentation/shift/actions/shifts'
import { getStoreClockRecords } from '@/presentation/clock-record/actions/clock-records'
import { getStoreUsers } from '@/presentation/store/actions/user-stores'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

export interface WorkSummaryDay {
  date: string
  scheduledHours: number // 予定時間（分）
  actualHours: number // 実際の勤務時間（分）
  breakMinutes: number // 休憩時間（分）
}

export interface WorkSummaryWeek {
  weekStart: string // 週の開始日
  weekEnd: string // 週の終了日
  scheduledHours: number
  actualHours: number
  breakMinutes: number
  days: WorkSummaryDay[]
}

export interface WorkSummaryMonth {
  year: number
  month: number
  scheduledHours: number
  actualHours: number
  breakMinutes: number
  days: WorkSummaryDay[]
}

/**
 * 打刻記録から実際の勤務時間を計算（分単位）
 */
function calculateActualWorkTime(
  clockRecords: Array<{
    type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
    selected_time: string
    status: 'pending' | 'approved' | 'rejected'
  }>
): { actualMinutes: number; breakMinutes: number } {
  // 承認済みのレコードのみを対象
  const approvedRecords = clockRecords.filter((r) => r.status === 'approved')

  // 日付ごとにグループ化
  const recordsByDate: Record<string, typeof approvedRecords> = {}
  approvedRecords.forEach((record) => {
    const date = record.selected_time.split('T')[0]
    if (!recordsByDate[date]) {
      recordsByDate[date] = []
    }
    recordsByDate[date].push(record)
  })

  let totalMinutes = 0
  let totalBreakMinutes = 0

  // 日付ごとに計算
  Object.values(recordsByDate).forEach((dayRecords) => {
    // 時刻順にソート
    const sorted = dayRecords.sort((a, b) =>
      a.selected_time.localeCompare(b.selected_time)
    )

    let clockInTime: Date | null = null
    let clockOutTime: Date | null = null
    let breakStartTime: Date | null = null
    let dayBreakMinutes = 0

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
            dayBreakMinutes +=
              (time.getTime() - breakStartTime.getTime()) / (1000 * 60)
            breakStartTime = null
          }
          break
      }
    })

    // 出勤と退勤がある場合のみ計算
    if (clockInTime !== null && clockOutTime !== null) {
      const clockIn = clockInTime as Date
      const clockOut = clockOutTime as Date
      const workMinutes =
        (clockOut.getTime() - clockIn.getTime()) / (1000 * 60)
      totalMinutes += workMinutes - dayBreakMinutes
      totalBreakMinutes += dayBreakMinutes
    }
  })

  return { actualMinutes: totalMinutes, breakMinutes: totalBreakMinutes }
}

/**
 * GetUserWorkSummaryByDayUseCase
 * ユーザーの日別勤務実績を取得するユースケース
 */
export class GetUserWorkSummaryByDayUseCase {
  async execute(
    userId: string,
    startDate: string,
    endDate: string,
    storeId?: number
  ): Promise<Result<WorkSummaryDay[]>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!startDate || !endDate) {
        return R.failure(
          new ValidationError('開始日と終了日を指定してください', 'date')
        )
      }

      const [shiftsResult, clockRecordsResult] = await Promise.all([
        getUserShifts(userId, startDate, endDate, storeId),
        getUserClockRecords(
          userId,
          `${startDate}T00:00:00`,
          `${endDate}T23:59:59`,
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

      // 日付ごとにグループ化
      const summaryByDate: Record<string, WorkSummaryDay> = {}

      // シフトを日付ごとにグループ化（scheduled_startから日付を抽出）
      shifts.forEach((shift) => {
        const date = new Date(shift.scheduled_start).toISOString().split('T')[0]
        if (!summaryByDate[date]) {
          summaryByDate[date] = {
            date,
            scheduledHours: 0,
            actualHours: 0,
            breakMinutes: 0,
          }
        }
        const start = new Date(shift.scheduled_start)
        const end = new Date(shift.scheduled_end)
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60)
        summaryByDate[date].scheduledHours += minutes
      })

      // 打刻記録を日付ごとにグループ化して計算
      const recordsByDate: Record<string, typeof clockRecords> = {}
      clockRecords.forEach((record) => {
        const date = record.selected_time.split('T')[0]
        if (!recordsByDate[date]) {
          recordsByDate[date] = []
        }
        recordsByDate[date].push(record)
      })

      Object.entries(recordsByDate).forEach(([date, records]) => {
        if (!summaryByDate[date]) {
          summaryByDate[date] = {
            date,
            scheduledHours: 0,
            actualHours: 0,
            breakMinutes: 0,
          }
        }
        const { actualMinutes, breakMinutes } = calculateActualWorkTime(records)
        summaryByDate[date].actualHours = actualMinutes
        summaryByDate[date].breakMinutes = breakMinutes
      })

      return R.success(
        Object.values(summaryByDate).sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      )
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '日別勤務実績の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}

/**
 * GetUserWorkSummaryByWeekUseCase
 * ユーザーの週別勤務実績を取得するユースケース
 */
export class GetUserWorkSummaryByWeekUseCase {
  constructor(
    private readonly getUserWorkSummaryByDayUseCase: GetUserWorkSummaryByDayUseCase
  ) {}

  async execute(
    userId: string,
    year: number,
    month: number,
    storeId?: number
  ): Promise<Result<WorkSummaryWeek[]>> {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const daySummaryResult = await this.getUserWorkSummaryByDayUseCase.execute(
        userId,
        startDateStr,
        endDateStr,
        storeId
      )

      if (!daySummaryResult.success) {
        return daySummaryResult
      }

      const days = daySummaryResult.data

      // 週ごとにグループ化
      const weeks: Record<string, WorkSummaryWeek> = {}

      days.forEach((day: WorkSummaryDay) => {
        const date = new Date(day.date)
        // 週の開始日（日曜日）を計算
        const dayOfWeek = date.getDay()
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - dayOfWeek)
        const weekStartStr = weekStart.toISOString().split('T')[0]

        // 週の終了日（土曜日）を計算
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const weekEndStr = weekEnd.toISOString().split('T')[0]

        const weekKey = `${weekStartStr}_${weekEndStr}`

        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            weekStart: weekStartStr,
            weekEnd: weekEndStr,
            scheduledHours: 0,
            actualHours: 0,
            breakMinutes: 0,
            days: [],
          }
        }

        weeks[weekKey].scheduledHours += day.scheduledHours
        weeks[weekKey].actualHours += day.actualHours
        weeks[weekKey].breakMinutes += day.breakMinutes
        weeks[weekKey].days.push(day)
      })

      return R.success(
        Object.values(weeks).sort((a, b) =>
          a.weekStart.localeCompare(b.weekStart)
        )
      )
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '週別勤務実績の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}

/**
 * GetUserWorkSummaryByMonthUseCase
 * ユーザーの月別勤務実績を取得するユースケース
 */
export class GetUserWorkSummaryByMonthUseCase {
  constructor(
    private readonly getUserWorkSummaryByDayUseCase: GetUserWorkSummaryByDayUseCase
  ) {}

  async execute(
    userId: string,
    year: number,
    month: number,
    storeId?: number
  ): Promise<Result<WorkSummaryMonth>> {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const daySummaryResult = await this.getUserWorkSummaryByDayUseCase.execute(
        userId,
        startDateStr,
        endDateStr,
        storeId
      )

      if (!daySummaryResult.success) {
        return daySummaryResult
      }

      const days = daySummaryResult.data

      const summary: WorkSummaryMonth = {
        year,
        month,
        scheduledHours: days.reduce((sum: number, day: WorkSummaryDay) => sum + day.scheduledHours, 0),
        actualHours: days.reduce((sum: number, day: WorkSummaryDay) => sum + day.actualHours, 0),
        breakMinutes: days.reduce((sum: number, day: WorkSummaryDay) => sum + day.breakMinutes, 0),
        days,
      }

      return R.success(summary)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '月別勤務実績の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}

/**
 * GetStoreWorkSummaryUseCase
 * 店舗の勤務実績集計を取得するユースケース（管理者向け）
 */
export class GetStoreWorkSummaryUseCase {
  async execute(
    storeId: number,
    year: number,
    month: number,
    userId?: string
  ): Promise<Result<Array<{
    userId: string
    userName: string
    scheduledHours: number
    actualHours: number
    breakMinutes: number
  }>>> {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      const [shiftsResult, clockRecordsResult, storeUsersResult] =
        await Promise.all([
          getStoreShifts(storeId, startDateStr, endDateStr),
          getStoreClockRecords(
            storeId,
            `${startDateStr}T00:00:00`,
            `${endDateStr}T23:59:59`
          ),
          getStoreUsers(storeId),
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

      if ('error' in storeUsersResult) {
        return R.failure(
          new ExternalServiceError('Store Service', storeUsersResult.error ?? '店舗ユーザーの取得に失敗しました')
        )
      }

      let shifts = shiftsResult.data || []
      let clockRecords = clockRecordsResult.data || []
      const storeUsers = storeUsersResult.data || []

      // ユーザー情報をマップに変換
      const userMap = new Map<
        string,
        { id: string; last_name: string; first_name: string }
      >()
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

      // 特定ユーザーでフィルター
      if (userId) {
        shifts = shifts.filter((shift) => shift.user_id === userId)
        clockRecords = clockRecords.filter(
          (record) => record.user_id === userId
        )
      }

      // ユーザーごとに集計
      const userSummaries: Record<
        string,
        {
          userId: string
          userName: string
          scheduledHours: number
          actualHours: number
          breakMinutes: number
        }
      > = {}

      // シフトから予定時間を集計
      shifts.forEach((shift) => {
        const userId = shift.user_id
        const userInfo = userMap.get(userId)
        const userName = userInfo
          ? `${userInfo.last_name}${userInfo.first_name}`.trim() || '不明'
          : '不明'

        if (!userSummaries[userId]) {
          userSummaries[userId] = {
            userId,
            userName,
            scheduledHours: 0,
            actualHours: 0,
            breakMinutes: 0,
          }
        }

        const start = new Date(shift.scheduled_start)
        const end = new Date(shift.scheduled_end)
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60)
        userSummaries[userId].scheduledHours += minutes
      })

      // 打刻記録から実際の勤務時間を集計
      const recordsByUser: Record<string, typeof clockRecords> = {}
      clockRecords.forEach((record) => {
        const userId = record.user_id
        if (!recordsByUser[userId]) {
          recordsByUser[userId] = []
        }
        recordsByUser[userId].push(record)
      })

      Object.entries(recordsByUser).forEach(([userId, records]) => {
        if (!userSummaries[userId]) {
          // usersが配列の場合、最初の要素を取得（1対1の関係なので）
          const recordUser = records[0]?.users
            ? Array.isArray(records[0].users)
              ? records[0].users[0]
              : records[0].users
            : null
          const userInfo = userMap.get(userId) || recordUser
          const userName = userInfo
            ? `${userInfo.last_name}${userInfo.first_name}`.trim() || '不明'
            : '不明'
          userSummaries[userId] = {
            userId,
            userName,
            scheduledHours: 0,
            actualHours: 0,
            breakMinutes: 0,
          }
        }
        const { actualMinutes, breakMinutes } = calculateActualWorkTime(records)
        userSummaries[userId].actualHours = actualMinutes
        userSummaries[userId].breakMinutes = breakMinutes
      })

      return R.success(Object.values(userSummaries))
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗勤務実績の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


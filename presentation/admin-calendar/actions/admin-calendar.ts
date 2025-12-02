'use server'

import {
  GetAdminCalendarDataUseCase,
  GetUnclockedUsersUseCase,
  type AdminCalendarDayData,
  type UnclockedUser,
} from '@/application/admin-calendar/use-cases/get-admin-calendar-data-use-case'
import { ErrorHandler } from '@/presentation/common/error-handler'
import { UserStoreDTO } from '@/presentation/store/dto/store-dto'

// 既存のインターフェースを維持（後方互換性）
export type { AdminCalendarDayData, UnclockedUser }

/**
 * 管理者向けカレンダー表示用のデータを取得（店舗のシフト + 打刻記録）
 */
export async function getAdminCalendarData(
  storeId: number,
  year: number,
  month: number,
  userId?: string,
  storeUsers?: UserStoreDTO[]
) {
  const useCase = new GetAdminCalendarDataUseCase()
  const result = await useCase.execute(storeId, year, month, userId, storeUsers)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '管理者カレンダーデータの取得に失敗しました' }
  }

  return { data: handled.data }
}

/**
 * 未打刻者リストを取得（指定日のシフトがあるが打刻がないユーザー）
 */
export async function getUnclockedUsers(storeId: number, date: string) {
  const useCase = new GetUnclockedUsersUseCase()
  const result = await useCase.execute(storeId, date)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '未打刻者リストの取得に失敗しました' }
  }

  return { data: handled.data }
}


'use server'

import { GetCalendarDataUseCase } from '@/application/calendar/use-cases/get-calendar-data-use-case'
import type { CalendarDayData } from '@/application/calendar/use-cases/get-calendar-data-use-case'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export type { CalendarDayData }

/**
 * カレンダー表示用のデータを取得（シフト + 打刻記録）
 */
export async function getCalendarData(
  userId: string,
  year: number,
  month: number,
  storeId?: number
) {
  const useCase = new GetCalendarDataUseCase()
  const result = await useCase.execute(userId, year, month, storeId)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'カレンダーデータの取得に失敗しました' }
  }

  return { data: handled.data }
}


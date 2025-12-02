'use server'

import {
  GetUserWorkSummaryByDayUseCase,
  GetUserWorkSummaryByWeekUseCase,
  GetUserWorkSummaryByMonthUseCase,
  GetStoreWorkSummaryUseCase,
  type WorkSummaryDay,
  type WorkSummaryWeek,
  type WorkSummaryMonth,
} from '@/application/work-summary/use-cases/get-work-summary-use-case'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export type { WorkSummaryDay, WorkSummaryWeek, WorkSummaryMonth }

/**
 * ユーザーの日別勤務実績を取得
 */
export async function getUserWorkSummaryByDay(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const useCase = new GetUserWorkSummaryByDayUseCase()
  const result = await useCase.execute(userId, startDate, endDate, storeId)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '日別勤務実績の取得に失敗しました' }
  }

  return { data: handled.data }
}

/**
 * ユーザーの週別勤務実績を取得
 */
export async function getUserWorkSummaryByWeek(
  userId: string,
  year: number,
  month: number,
  storeId?: number
) {
  const getUserWorkSummaryByDayUseCase = new GetUserWorkSummaryByDayUseCase()
  const useCase = new GetUserWorkSummaryByWeekUseCase(
    getUserWorkSummaryByDayUseCase
  )
  const result = await useCase.execute(userId, year, month, storeId)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '週別勤務実績の取得に失敗しました' }
  }

  return { data: handled.data }
}

/**
 * ユーザーの月別勤務実績を取得
 */
export async function getUserWorkSummaryByMonth(
  userId: string,
  year: number,
  month: number,
  storeId?: number
) {
  const getUserWorkSummaryByDayUseCase = new GetUserWorkSummaryByDayUseCase()
  const useCase = new GetUserWorkSummaryByMonthUseCase(
    getUserWorkSummaryByDayUseCase
  )
  const result = await useCase.execute(userId, year, month, storeId)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '月別勤務実績の取得に失敗しました' }
  }

  return { data: handled.data }
}

/**
 * 店舗の勤務実績集計を取得（管理者向け）
 */
export async function getStoreWorkSummary(
  storeId: number,
  year: number,
  month: number,
  userId?: string
) {
  const useCase = new GetStoreWorkSummaryUseCase()
  const result = await useCase.execute(storeId, year, month, userId)
  
  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗勤務実績の取得に失敗しました' }
  }

  return { data: handled.data }
}


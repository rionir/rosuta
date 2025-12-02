'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseShiftRepository } from '@/infrastructure/repositories/shift/supabase-shift-repository'
import { CopyShiftsUseCase } from '@/application/shift/use-cases/copy-shifts-use-case'
import { CopyShiftsDTO } from '@/application/shift/dto/copy-shifts-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export interface CopyShiftsInput {
  userId: string // 操作者（管理者）
  sourceDate: string // YYYY-MM-DD
  targetDate: string // YYYY-MM-DD
  storeId?: number // 店舗指定（オプション）
  overwrite: boolean // 既存シフトを上書きするか
}

/**
 * シフトをコピー（日/週/月コピー機能）
 */
export async function copyShifts(input: CopyShiftsInput) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const copyShiftsUseCase = new CopyShiftsUseCase(shiftRepository, supabase)

  const dto: CopyShiftsDTO = {
    userId: input.userId,
    sourceDate: input.sourceDate,
    targetDate: input.targetDate,
    storeId: input.storeId,
    overwrite: input.overwrite,
  }

  const result = await copyShiftsUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフトのコピーに失敗しました' }
  }

  revalidatePath('/app/admin/shifts')
  return { data: handled.data }
}


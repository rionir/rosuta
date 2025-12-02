'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseShiftRepository } from '@/infrastructure/repositories/shift/supabase-shift-repository'
import { CreateShiftBreakUseCase } from '@/application/shift/use-cases/create-shift-break-use-case'
import { UpdateShiftBreakUseCase } from '@/application/shift/use-cases/update-shift-break-use-case'
import { DeleteShiftBreakUseCase } from '@/application/shift/use-cases/delete-shift-break-use-case'
import { GetShiftBreaksUseCase } from '@/application/shift/use-cases/get-shift-breaks-use-case'
import { CreateShiftBreakDTO } from '@/application/shift/dto/create-shift-break-dto'
import { UpdateShiftBreakDTO } from '@/application/shift/dto/update-shift-break-dto'
import { ShiftBreakDTO } from '@/presentation/shift/dto/shift-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export interface CreateShiftBreakInput {
  shiftId: number
  breakStart: string // ISO 8601 TIMESTAMP
  breakEnd: string // ISO 8601 TIMESTAMP
}

export interface UpdateShiftBreakInput {
  breakId: number
  breakStart?: string
  breakEnd?: string
}

/**
 * 休憩を作成
 */
export async function createShiftBreak(input: CreateShiftBreakInput) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const createShiftBreakUseCase = new CreateShiftBreakUseCase(shiftRepository)

  const dto: CreateShiftBreakDTO = {
    shiftId: input.shiftId,
    breakStart: input.breakStart,
    breakEnd: input.breakEnd,
  }

  const result = await createShiftBreakUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '休憩の作成に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftBreakDTO = handled.data.toDTO()

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * 休憩を更新
 */
export async function updateShiftBreak(input: UpdateShiftBreakInput) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const updateShiftBreakUseCase = new UpdateShiftBreakUseCase(shiftRepository)

  const dto: UpdateShiftBreakDTO = {
    breakId: input.breakId,
    breakStart: input.breakStart,
    breakEnd: input.breakEnd,
  }

  const result = await updateShiftBreakUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '休憩の更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftBreakDTO = handled.data.toDTO()

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * 休憩を削除
 */
export async function deleteShiftBreak(breakId: number) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const deleteShiftBreakUseCase = new DeleteShiftBreakUseCase(shiftRepository)

  const result = await deleteShiftBreakUseCase.execute(breakId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data: { success: true } }
}

/**
 * シフトの休憩一覧を取得
 */
export async function getShiftBreaks(shiftId: number) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const getShiftBreaksUseCase = new GetShiftBreaksUseCase(shiftRepository)

  const result = await getShiftBreaksUseCase.execute(shiftId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '休憩一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftBreakDTO[] = handled.data.map((shiftBreak) => shiftBreak.toDTO())

  return { data }
}


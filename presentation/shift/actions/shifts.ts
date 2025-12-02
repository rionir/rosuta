'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SupabaseShiftRepository } from '@/infrastructure/repositories/shift/supabase-shift-repository'
import { CreateShiftUseCase } from '@/application/shift/use-cases/create-shift-use-case'
import { UpdateShiftUseCase } from '@/application/shift/use-cases/update-shift-use-case'
import { DeleteShiftUseCase } from '@/application/shift/use-cases/delete-shift-use-case'
import { GetUserShiftsUseCase } from '@/application/shift/use-cases/get-user-shifts-use-case'
import { GetStoreShiftsUseCase } from '@/application/shift/use-cases/get-store-shifts-use-case'
import { CreateShiftDTO } from '@/application/shift/dto/create-shift-dto'
import { UpdateShiftDTO } from '@/application/shift/dto/update-shift-dto'
import { ShiftDTO } from '@/presentation/shift/dto/shift-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export interface CreateShiftInput {
  userId: string
  storeId: number
  scheduledStart: string // ISO 8601 TIMESTAMP
  scheduledEnd: string // ISO 8601 TIMESTAMP
  createdBy: string
}

export interface UpdateShiftInput {
  shiftId: number
  scheduledStart?: string
  scheduledEnd?: string
}

/**
 * シフトを作成
 */
export async function createShift(input: CreateShiftInput) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const createShiftUseCase = new CreateShiftUseCase(shiftRepository)

  const dto: CreateShiftDTO = {
    userId: input.userId,
    storeId: input.storeId,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    createdBy: input.createdBy,
  }

  const result = await createShiftUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフトの作成に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftDTO = handled.data.toDTO()

  // キャッシュを無効化
  revalidateTag(`shifts-store-${data.store_id}`, 'max')
  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * シフトを更新
 */
export async function updateShift(input: UpdateShiftInput) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const updateShiftUseCase = new UpdateShiftUseCase(shiftRepository)

  const dto: UpdateShiftDTO = {
    shiftId: input.shiftId,
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
  }

  const result = await updateShiftUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフトの更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftDTO = handled.data.toDTO()

  // キャッシュを無効化
  revalidateTag(`shifts-store-${data.store_id}`, 'max')
  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data }
}

/**
 * シフトを削除
 */
export async function deleteShift(shiftId: number) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const deleteShiftUseCase = new DeleteShiftUseCase(shiftRepository)

  const result = await deleteShiftUseCase.execute(shiftId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフトの削除に失敗しました' }
  }

  // キャッシュを無効化
  if (handled.data.storeId) {
    revalidateTag(`shifts-store-${handled.data.storeId}`, 'max')
  }
  revalidatePath('/app/shifts')
  revalidatePath('/app/admin/shifts')
  return { data: { success: true } }
}

/**
 * ユーザーのシフト一覧を取得（日付範囲指定）
 * エンティティをDTOに変換（シリアライズ可能な形式）
 * エンティティのプロパティを直接使用して、エンティティのロジックを活用
 */
export async function getUserShifts(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const getUserShiftsUseCase = new GetUserShiftsUseCase(shiftRepository)

  const result = await getUserShiftsUseCase.execute(
    userId,
    startDate,
    endDate,
    storeId
  )

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフト一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftDTO[] = handled.data.map((shift) => shift.toDTO())

  return { data }
}

/**
 * 店舗のシフト一覧を取得（日付範囲指定）
 * エンティティをDTOに変換（シリアライズ可能な形式）
 * エンティティのプロパティを直接使用して、エンティティのロジックを活用
 */
export async function getStoreShifts(
  storeId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const shiftRepository = new SupabaseShiftRepository(supabase)
  const getStoreShiftsUseCase = new GetStoreShiftsUseCase(shiftRepository)

  const result = await getStoreShiftsUseCase.execute(
    storeId,
    startDate,
    endDate
  )

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'シフト一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ShiftDTO[] = handled.data.map((shift) => shift.toDTO())

  return { data }
}


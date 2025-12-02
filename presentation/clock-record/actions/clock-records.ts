'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SupabaseClockRecordRepository } from '@/infrastructure/repositories/clock-record/supabase-clock-record-repository'
import { SupabaseUserRepository } from '@/infrastructure/repositories/user/supabase-user-repository'
import { CreateClockRecordUseCase } from '@/application/clock-record/use-cases/create-clock-record-use-case'
import { UpdateClockRecordUseCase } from '@/application/clock-record/use-cases/update-clock-record-use-case'
import { ApproveClockRecordUseCase } from '@/application/clock-record/use-cases/approve-clock-record-use-case'
import { GetUserClockRecordsUseCase } from '@/application/clock-record/use-cases/get-user-clock-records-use-case'
import { GetStoreClockRecordsUseCase } from '@/application/clock-record/use-cases/get-store-clock-records-use-case'
import { GetPendingClockRecordsUseCase } from '@/application/clock-record/use-cases/get-pending-clock-records-use-case'
import { GetCurrentWorkStatusUseCase } from '@/application/clock-record/use-cases/get-current-work-status-use-case'
import { CreateClockRecordDTO } from '@/application/clock-record/dto/create-clock-record-dto'
import { UpdateClockRecordDTO } from '@/application/clock-record/dto/update-clock-record-dto'
import { ClockRecordWithStoreDTO, ClockRecordWithUserDTO } from '@/presentation/clock-record/dto/clock-record-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export type ClockRecordType = 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
export type ClockRecordMethod = 'scheduled' | 'current' | 'manual'
export type ClockRecordStatus = 'pending' | 'approved' | 'rejected'

export interface CreateClockRecordInput {
  userId: string
  storeId: number
  shiftId?: number
  breakId?: number
  type: ClockRecordType
  selectedTime: string // ISO timestamp
  actualTime: string // ISO timestamp
  method: ClockRecordMethod
  createdBy: string
}

export interface UpdateClockRecordInput {
  recordId: number
  selectedTime?: string
  status?: ClockRecordStatus
  approvedBy?: string
}

/**
 * 打刻記録を作成
 */
export async function createClockRecord(input: CreateClockRecordInput) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const createClockRecordUseCase = new CreateClockRecordUseCase(
    clockRecordRepository,
    supabase
  )

  const dto: CreateClockRecordDTO = {
    userId: input.userId,
    storeId: input.storeId,
    shiftId: input.shiftId,
    breakId: input.breakId,
    type: input.type,
    selectedTime: input.selectedTime,
    actualTime: input.actualTime,
    method: input.method,
    createdBy: input.createdBy,
  }

  const result = await createClockRecordUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '打刻記録の作成に失敗しました' }
  }

  // エンティティをDTOに変換
  const data = handled.data.toDTO()

  // キャッシュを無効化
  revalidateTag(`clock-records-store-${data.store_id}`, 'max')
  revalidatePath('/app/clock')
  revalidatePath('/app/admin/clock-records')
  return { data }
}

/**
 * 打刻記録を更新（承認制適用）
 */
export async function updateClockRecord(input: UpdateClockRecordInput) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const updateClockRecordUseCase = new UpdateClockRecordUseCase(
    clockRecordRepository,
    supabase
  )

  const dto: UpdateClockRecordDTO = {
    recordId: input.recordId,
    selectedTime: input.selectedTime,
    status: input.status,
    approvedBy: input.approvedBy,
  }

  const result = await updateClockRecordUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '打刻記録の更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data = handled.data.toDTO()

  // キャッシュを無効化
  revalidateTag(`clock-records-store-${data.store_id}`, 'max')
  revalidatePath('/app/clock')
  revalidatePath('/app/admin/clock-records')
  return { data }
}

/**
 * 打刻記録を承認/却下
 */
export async function approveClockRecord(
  recordId: number,
  status: 'approved' | 'rejected',
  approvedBy: string
) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const approveClockRecordUseCase = new ApproveClockRecordUseCase(
    clockRecordRepository
  )

  const result = await approveClockRecordUseCase.execute(
    recordId,
    status,
    approvedBy
  )

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '打刻記録の承認/却下に失敗しました' }
  }

  // エンティティをDTOに変換
  const data = handled.data.toDTO()

  // キャッシュを無効化
  revalidateTag(`clock-records-store-${data.store_id}`, 'max')
  revalidatePath('/app/admin/clock-records')
  return { data }
}

/**
 * ユーザーの打刻記録一覧を取得（日付範囲指定）
 */
export async function getUserClockRecords(
  userId: string,
  startDate: string,
  endDate: string,
  storeId?: number
) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const getUserClockRecordsUseCase = new GetUserClockRecordsUseCase(
    clockRecordRepository
  )

  const result = await getUserClockRecordsUseCase.execute(
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
    return { error: '打刻記録一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ClockRecordWithStoreDTO[] = handled.data.map(({ clockRecord, store }) => ({
    ...clockRecord.toDTO(),
    company_stores: store ? {
      id: store.id,
      name: store.name,
    } : null,
  }))

  return { data }
}

/**
 * 店舗の打刻記録一覧を取得（日付範囲指定）
 */
export async function getStoreClockRecords(
  storeId: number,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const getStoreClockRecordsUseCase = new GetStoreClockRecordsUseCase(
    clockRecordRepository
  )

  const result = await getStoreClockRecordsUseCase.execute(
    storeId,
    startDate,
    endDate
  )

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '打刻記録一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: ClockRecordWithUserDTO[] = handled.data.map(({ clockRecord, user }) => ({
    ...clockRecord.toDTO(),
    users: user ? user.toDTO() : null,
  }))

  return { data }
}

/**
 * 承認待ちの打刻記録一覧を取得
 */
export async function getPendingClockRecords(storeId: number) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const userRepository = new SupabaseUserRepository(supabase)
  const getPendingClockRecordsUseCase = new GetPendingClockRecordsUseCase(
    clockRecordRepository,
    userRepository
  )

  const result = await getPendingClockRecordsUseCase.execute(storeId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '承認待ち打刻記録一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  // usersがnullの場合はフィルタリング（既存のUIとの互換性のため）
  const data = handled.data
    .filter(({ user }) => user !== null)
    .map(({ clockRecord, user }) => ({
      ...clockRecord.toDTO(),
      users: user!.toDTO(),
    }))

  return { data }
}

/**
 * ユーザーの現在の勤務ステータスを取得
 */
export async function getCurrentWorkStatus(userId: string, storeId: number) {
  const supabase = await createClient()

  const clockRecordRepository = new SupabaseClockRecordRepository(supabase)
  const getCurrentWorkStatusUseCase = new GetCurrentWorkStatusUseCase(
    clockRecordRepository
  )

  const result = await getCurrentWorkStatusUseCase.execute(userId, storeId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '勤務ステータスの取得に失敗しました' }
  }

  // DTO形式に変換（既存のUIとの互換性）
  const data = {
    status: handled.data.status,
    lastRecord: handled.data.lastRecord ? handled.data.lastRecord.toDTO() : null,
    records: handled.data.records.map((r) => r.toDTO()),
  }

  return { data }
}


'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { SupabaseUserStoreRepository } from '@/infrastructure/repositories/store/supabase-user-store-repository'
import { AssignUserToStoreUseCase } from '@/application/store/use-cases/assign-user-to-store-use-case'
import { UpdateUserStoreUseCase } from '@/application/store/use-cases/update-user-store-use-case'
import { GetUserStoresUseCase } from '@/application/store/use-cases/get-user-stores-use-case'
import { GetStoreUsersUseCase } from '@/application/store/use-cases/get-store-users-use-case'
import { AssignUserToStoreDTO } from '@/application/store/dto/assign-user-to-store-dto'
import { UpdateUserStoreDTO } from '@/application/store/dto/update-user-store-dto'
import { UserStoreDTO, UserStoreWithStoreDTO } from '@/presentation/store/dto/store-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export interface AssignUserToStoreInput {
  userId: string
  storeId: number
}

export interface UpdateUserStoreInput {
  userId: string
  storeId: number
  isActive: boolean
}

/**
 * ユーザーを店舗に所属させる
 */
export async function assignUserToStore(input: AssignUserToStoreInput) {
  const supabase = await createClient()

  const userStoreRepository = new SupabaseUserStoreRepository(supabase)
  const assignUserToStoreUseCase = new AssignUserToStoreUseCase(
    userStoreRepository
  )

  const dto: AssignUserToStoreDTO = {
    userId: input.userId,
    storeId: input.storeId,
  }

  const result = await assignUserToStoreUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'ユーザーの店舗所属に失敗しました' }
  }

  // キャッシュを無効化
  revalidateTag(`store-users-${input.storeId}`, 'max')
  revalidatePath('/app/admin/users')
  return { data: handled.data }
}

/**
 * ユーザーの店舗所属を更新
 */
export async function updateUserStore(input: UpdateUserStoreInput) {
  const supabase = await createClient()

  const userStoreRepository = new SupabaseUserStoreRepository(supabase)
  const updateUserStoreUseCase = new UpdateUserStoreUseCase(userStoreRepository)

  const dto: UpdateUserStoreDTO = {
    userId: input.userId,
    storeId: input.storeId,
    isActive: input.isActive,
  }

  const result = await updateUserStoreUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'ユーザー店舗所属の更新に失敗しました' }
  }

  // キャッシュを無効化
  revalidateTag(`store-users-${input.storeId}`, 'max')
  revalidatePath('/app/admin/users')
  return { data: handled.data }
}

/**
 * ユーザーが所属する店舗一覧を取得
 */
export async function getUserStores(userId: string) {
  const supabase = await createClient()

  const userStoreRepository = new SupabaseUserStoreRepository(supabase)
  const getUserStoresUseCase = new GetUserStoresUseCase(userStoreRepository)

  const result = await getUserStoresUseCase.execute(userId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換（シリアライズ可能な形式）
  // エンティティのプロパティを直接使用（エンティティのロジックを活用）
  const data: UserStoreWithStoreDTO[] = handled.data.map(({ userStore, store }) => ({
    id: userStore.id,
    user_id: userStore.userId,
    store_id: userStore.storeId,
    is_active: userStore.isActive,
    created_at: userStore.createdAt.toISOString(),
    updated_at: userStore.updatedAt.toISOString(),
    company_stores: store ? {
      id: store.id,
      company_id: store.companyId,
      name: store.name,
      address: store.address,
    } : null,
  }))

  return { data }
}

/**
 * 店舗に所属するユーザー一覧を取得
 */
export async function getStoreUsers(storeId: number) {
  const supabase = await createClient()

  const userStoreRepository = new SupabaseUserStoreRepository(supabase)
  const getStoreUsersUseCase = new GetStoreUsersUseCase(userStoreRepository)

  const result = await getStoreUsersUseCase.execute(storeId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗ユーザー一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換（シリアライズ可能な形式）
  // エンティティのプロパティを直接使用（エンティティのロジックを活用）
  const data: UserStoreDTO[] = handled.data.map(({ userStore, user }) => ({
    user_id: userStore.userId,
    store_id: userStore.storeId,
    is_active: userStore.isActive,
    created_at: userStore.createdAt.toISOString(),
    users: user ? {
      id: user.id,
      last_name: user.lastName,
      first_name: user.firstName,
    } : null,
  }))

  return { data }
}


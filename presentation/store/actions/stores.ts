'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseStoreRepository } from '@/infrastructure/repositories/store/supabase-store-repository'
import { CreateStoreUseCase } from '@/application/store/use-cases/create-store-use-case'
import { UpdateStoreUseCase } from '@/application/store/use-cases/update-store-use-case'
import { GetCompanyStoresUseCase } from '@/application/store/use-cases/get-company-stores-use-case'
import { GetStoreUseCase } from '@/application/store/use-cases/get-store-use-case'
import { CreateStoreDTO } from '@/application/store/dto/create-store-dto'
import { UpdateStoreDTO } from '@/application/store/dto/update-store-dto'
import { StoreDTO } from '@/presentation/store/dto/store-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'

// 既存のインターフェースを維持（後方互換性）
export interface CreateStoreInput {
  companyId: number
  name: string
  address?: string
}

export interface UpdateStoreInput {
  storeId: number
  name?: string
  address?: string
}

/**
 * 店舗を作成
 */
export async function createStore(input: CreateStoreInput) {
  const supabase = await createClient()

  const storeRepository = new SupabaseStoreRepository(supabase)
  const createStoreUseCase = new CreateStoreUseCase(storeRepository, supabase)

  const dto: CreateStoreDTO = {
    companyId: input.companyId,
    name: input.name,
    address: input.address,
  }

  const result = await createStoreUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗の作成に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: StoreDTO = handled.data.toDTO()

  revalidatePath('/app/admin/stores')
  return { data }
}

/**
 * 店舗情報を更新
 */
export async function updateStore(input: UpdateStoreInput) {
  const supabase = await createClient()

  const storeRepository = new SupabaseStoreRepository(supabase)
  const updateStoreUseCase = new UpdateStoreUseCase(storeRepository)

  const dto: UpdateStoreDTO = {
    storeId: input.storeId,
    name: input.name,
    address: input.address,
  }

  const result = await updateStoreUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗の更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: StoreDTO = handled.data.toDTO()

  revalidatePath('/app/admin/stores')
  return { data }
}

/**
 * 企業に所属する店舗一覧を取得
 */
export async function getCompanyStores(companyId: number) {
  const supabase = await createClient()

  const storeRepository = new SupabaseStoreRepository(supabase)
  const getCompanyStoresUseCase = new GetCompanyStoresUseCase(storeRepository)

  const result = await getCompanyStoresUseCase.execute(companyId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: StoreDTO[] = handled.data.map((store) => store.toDTO())

  return { data }
}

/**
 * 店舗情報を取得
 */
export async function getStore(storeId: number) {
  const supabase = await createClient()

  const storeRepository = new SupabaseStoreRepository(supabase)
  const getStoreUseCase = new GetStoreUseCase(storeRepository)

  const result = await getStoreUseCase.execute(storeId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗情報の取得に失敗しました' }
  }

  return { data: handled.data.toDTO() }
}


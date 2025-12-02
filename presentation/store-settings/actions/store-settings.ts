'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseStoreSettingsRepository } from '@/infrastructure/repositories/store-settings/supabase-store-settings-repository'
import { UpdateStoreSettingsUseCase } from '@/application/store-settings/use-cases/update-store-settings-use-case'
import { GetStoreSettingsUseCase } from '@/application/store-settings/use-cases/get-store-settings-use-case'
import { UpdateStoreSettingsDTO } from '@/application/store-settings/dto/update-store-settings-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'
import { StoreSettingsDTO } from '@/presentation/store-settings/dto/store-settings-dto'

// 既存のインターフェースを維持（後方互換性）
export interface UpdateStoreSettingsInput {
  storeId: number
  approvalRequired: boolean
}

/**
 * 店舗設定を更新
 */
export async function updateStoreSettings(input: UpdateStoreSettingsInput) {
  const supabase = await createClient()

  const storeSettingsRepository = new SupabaseStoreSettingsRepository(supabase)
  const updateStoreSettingsUseCase = new UpdateStoreSettingsUseCase(
    storeSettingsRepository
  )

  const dto: UpdateStoreSettingsDTO = {
    storeId: input.storeId,
    approvalRequired: input.approvalRequired,
  }

  const result = await updateStoreSettingsUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗設定の更新に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: StoreSettingsDTO = handled.data.toDTO()

  revalidatePath('/app/admin/stores')
  revalidatePath('/app/admin/settings')
  return { data }
}

/**
 * 店舗設定を取得
 */
export async function getStoreSettings(storeId: number) {
  const supabase = await createClient()

  const storeSettingsRepository = new SupabaseStoreSettingsRepository(supabase)
  const getStoreSettingsUseCase = new GetStoreSettingsUseCase(
    storeSettingsRepository
  )

  const result = await getStoreSettingsUseCase.execute(storeId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '店舗設定の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: StoreSettingsDTO = handled.data.toDTO()

  return { data }
}


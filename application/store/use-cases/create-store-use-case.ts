import { IStoreRepository } from '@/domain/store/repositories/store-repository'
import { Store } from '@/domain/store/entities/store'
import { CreateStoreDTO } from '../dto/create-store-dto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

/**
 * CreateStoreUseCase
 * 店舗作成のユースケース
 * 店舗作成後、店舗設定をデフォルトで作成
 */
export class CreateStoreUseCase {
  constructor(
    private readonly storeRepository: IStoreRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(dto: CreateStoreDTO): Promise<Result<Store>> {
    try {
      // バリデーション
      if (!dto.companyId || dto.companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      if (!dto.name || dto.name.trim().length === 0) {
        return R.failure(
          new ValidationError('店舗名が指定されていません', 'name')
        )
      }

      const store = new Store(
        0, // IDはDBで生成されるため0を設定
        dto.companyId,
        dto.name,
        dto.address || null,
        new Date(),
        new Date()
      )

      const createdStore = await this.storeRepository.createStore(store)

      // 店舗設定をデフォルトで作成
      const { error: settingsError } = await this.supabase.from('store_settings').insert({
        store_id: createdStore.id,
        approval_required: false,
      })

      if (settingsError) {
        return R.failure(
          new ExternalServiceError('Supabase', `店舗設定の作成に失敗しました: ${settingsError.message}`)
        )
      }

      return R.success(createdStore)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗の作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


import { IStoreSettingsRepository } from '@/domain/store-settings/repositories/store-settings-repository'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { StoreSettings } from '@/domain/store-settings/entities/store-settings'

/**
 * GetStoreSettingsUseCase
 * 店舗設定を取得するユースケース
 */
export class GetStoreSettingsUseCase {
  constructor(
    private readonly storeSettingsRepository: IStoreSettingsRepository
  ) {}

  async execute(storeId: number): Promise<Result<StoreSettings>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const settings = await this.storeSettingsRepository.findByStoreId(storeId)

      if (!settings) {
        return R.failure(
          new NotFoundError('店舗設定', storeId)
        )
      }

      return R.success(settings)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗設定の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


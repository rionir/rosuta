import { IStoreSettingsRepository } from '@/domain/store-settings/repositories/store-settings-repository'
import { UpdateStoreSettingsDTO } from '../dto/update-store-settings-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { StoreSettings } from '@/domain/store-settings/entities/store-settings'

/**
 * UpdateStoreSettingsUseCase
 * 店舗設定更新のユースケース
 */
export class UpdateStoreSettingsUseCase {
  constructor(
    private readonly storeSettingsRepository: IStoreSettingsRepository
  ) {}

  async execute(
    dto: UpdateStoreSettingsDTO
  ): Promise<Result<StoreSettings>> {
    try {
      // バリデーション
      if (!dto.storeId || dto.storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      if (dto.approvalRequired === undefined) {
        return R.failure(
          new ValidationError('承認必須設定が指定されていません', 'approvalRequired')
        )
      }

      const settings = await this.storeSettingsRepository.findByStoreId(
        dto.storeId
      )

      if (!settings) {
        return R.failure(
          new NotFoundError('店舗設定', dto.storeId)
        )
      }

      const updatedSettings = settings.updateApprovalRequired(
        dto.approvalRequired
      )

      const result = await this.storeSettingsRepository.updateStoreSettings(
        updatedSettings
      )

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗設定の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


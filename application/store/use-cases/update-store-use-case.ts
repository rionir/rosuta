import { IStoreRepository } from '@/domain/store/repositories/store-repository'
import { UpdateStoreDTO } from '../dto/update-store-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { Store } from '@/domain/store/entities/store'

/**
 * UpdateStoreUseCase
 * 店舗更新のユースケース
 */
export class UpdateStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(
    dto: UpdateStoreDTO
  ): Promise<Result<Store>> {
    try {
      // バリデーション
      if (!dto.storeId || dto.storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const store = await this.storeRepository.findById(dto.storeId)

      if (!store) {
        return R.failure(
          new NotFoundError('店舗', dto.storeId)
        )
      }

      let updatedStore = store

      if (dto.name) {
        if (dto.name.trim().length === 0) {
          return R.failure(
            new ValidationError('店舗名が空です', 'name')
          )
        }
        updatedStore = updatedStore.updateName(dto.name)
      }

      if (dto.address !== undefined) {
        updatedStore = updatedStore.updateAddress(dto.address)
      }

      const result = await this.storeRepository.updateStore(updatedStore)

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


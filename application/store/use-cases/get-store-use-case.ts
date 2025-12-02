import { IStoreRepository } from '@/domain/store/repositories/store-repository'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { Store } from '@/domain/store/entities/store'

/**
 * GetStoreUseCase
 * 店舗情報を取得するユースケース
 */
export class GetStoreUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(storeId: number): Promise<Result<Store>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const store = await this.storeRepository.findById(storeId)

      if (!store) {
        return R.failure(
          new NotFoundError('店舗', storeId)
        )
      }

      return R.success(store)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗情報の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


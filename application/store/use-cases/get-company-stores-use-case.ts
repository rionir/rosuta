import { IStoreRepository } from '@/domain/store/repositories/store-repository'
import { Store } from '@/domain/store/entities/store'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetCompanyStoresUseCase
 * 企業に所属する店舗一覧を取得するユースケース
 */
export class GetCompanyStoresUseCase {
  constructor(private readonly storeRepository: IStoreRepository) {}

  async execute(
    companyId: number
  ): Promise<Result<Store[]>> {
    try {
      // バリデーション
      if (!companyId || companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      const stores = await this.storeRepository.findCompanyStores(companyId)

      return R.success(stores)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '店舗一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


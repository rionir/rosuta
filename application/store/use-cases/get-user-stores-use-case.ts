import { IUserStoreRepository } from '@/domain/store/repositories/user-store-repository'
import { UserStore } from '@/domain/store/entities/user-store'
import { Store } from '@/domain/store/entities/store'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetUserStoresUseCase
 * ユーザーが所属する店舗一覧を取得するユースケース
 */
export class GetUserStoresUseCase {
  constructor(private readonly userStoreRepository: IUserStoreRepository) {}

  async execute(userId: string): Promise<Result<Array<{ userStore: UserStore; store: Store | null }>>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      const data = await this.userStoreRepository.findUserStoresWithStores(userId)

      return R.success(data)
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


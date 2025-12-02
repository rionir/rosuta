import { IUserStoreRepository } from '@/domain/store/repositories/user-store-repository'
import { UserStore } from '@/domain/store/entities/user-store'
import { User } from '@/domain/user/entities/user'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetStoreUsersUseCase
 * 店舗に所属するユーザー一覧を取得するユースケース
 */
export class GetStoreUsersUseCase {
  constructor(private readonly userStoreRepository: IUserStoreRepository) {}

  async execute(storeId: number): Promise<Result<Array<{ userStore: UserStore; user: User | null }>>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const data = await this.userStoreRepository.findStoreUsersWithUsers(storeId)

      return R.success(data)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザー一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


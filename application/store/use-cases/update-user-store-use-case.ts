import { IUserStoreRepository } from '@/domain/store/repositories/user-store-repository'
import { UpdateUserStoreDTO } from '../dto/update-user-store-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { UserStore } from '@/domain/store/entities/user-store'

/**
 * UpdateUserStoreUseCase
 * ユーザーの店舗所属を更新するユースケース
 */
export class UpdateUserStoreUseCase {
  constructor(private readonly userStoreRepository: IUserStoreRepository) {}

  async execute(
    dto: UpdateUserStoreDTO
  ): Promise<Result<UserStore>> {
    try {
      // バリデーション
      if (!dto.userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!dto.storeId || dto.storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const userStore = await this.userStoreRepository.findByUserIdAndStoreId(
        dto.userId,
        dto.storeId
      )

      if (!userStore) {
        return R.failure(
          new NotFoundError('ユーザー店舗所属', `${dto.userId}-${dto.storeId}`)
        )
      }

      const updatedUserStore = userStore.updateActiveStatus(dto.isActive)
      const result = await this.userStoreRepository.updateUserStore(
        updatedUserStore
      )

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザー店舗所属の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


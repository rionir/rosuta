import { IUserStoreRepository } from '@/domain/store/repositories/user-store-repository'
import { UserStore } from '@/domain/store/entities/user-store'
import { AssignUserToStoreDTO } from '../dto/assign-user-to-store-dto'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * AssignUserToStoreUseCase
 * ユーザーを店舗に所属させるユースケース
 * 既に存在する場合は有効化
 */
export class AssignUserToStoreUseCase {
  constructor(private readonly userStoreRepository: IUserStoreRepository) {}

  async execute(
    dto: AssignUserToStoreDTO
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

      const userStore = new UserStore(
        0, // IDはDBで生成されるため0を設定
        dto.userId,
        dto.storeId,
        true, // 有効化
        new Date(),
        new Date()
      )

      // 既に存在する場合は有効化、存在しない場合は作成
      const result = await this.userStoreRepository.upsertUserStore(userStore)

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザーの店舗所属に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


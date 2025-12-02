import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * DeleteUserUseCase
 * ユーザー削除のユースケース（論理削除）
 * company_usersテーブルのis_activeをfalseに設定
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<Result<{ success: boolean }>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      await this.userRepository.updateCompanyUserByUserId(userId, {
        isActive: false,
      })

      return R.success({ success: true })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザーの削除に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


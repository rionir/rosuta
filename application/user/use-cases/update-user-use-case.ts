import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { UpdateUserDTO } from '../dto/update-user-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * UpdateUserUseCase
 * ユーザー更新のユースケース
 * usersテーブルとcompany_usersテーブルを更新
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    dto: UpdateUserDTO
  ): Promise<Result<{ success: boolean }>> {
    try {
      // バリデーション
      if (!dto.userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      // usersテーブルの更新
      if (dto.last_name !== undefined || dto.first_name !== undefined) {
        const user = await this.userRepository.findById(dto.userId)
        if (!user) {
          return R.failure(
            new NotFoundError('ユーザー', dto.userId)
          )
        }

        // last_nameとfirst_nameの決定（部分的に更新する場合も対応）
        const lastName = dto.last_name !== undefined ? dto.last_name.trim() : user.lastName
        const firstName = dto.first_name !== undefined ? dto.first_name.trim() : user.firstName

        const updatedUser = user.updateName(lastName, firstName)
        await this.userRepository.updateUser(updatedUser)
      }

      // company_usersテーブルの更新
      if (dto.isAdmin !== undefined || dto.isActive !== undefined) {
        await this.userRepository.updateCompanyUserByUserId(dto.userId, {
          isAdmin: dto.isAdmin,
          isActive: dto.isActive,
        })
      }

      return R.success({ success: true })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザーの更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


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
      if (dto.name) {
        const user = await this.userRepository.findById(dto.userId)
        if (!user) {
          return R.failure(
            new NotFoundError('ユーザー', dto.userId)
          )
        }

        // 名前をlast_nameとfirst_nameに分割
        const nameParts = dto.name.trim().split(/\s+/)
        const lastName = nameParts[0] || ''
        const firstName = nameParts.slice(1).join(' ') || ''

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


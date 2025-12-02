import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { CompanyUser } from '@/domain/user/entities/company-user'
import { User } from '@/domain/user/entities/user'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetCompanyUsersWithUsersUseCase
 * 企業に所属するユーザー一覧を取得するユースケース（users情報も含む）
 */
export class GetCompanyUsersWithUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    companyId: number
  ): Promise<Result<Array<{ companyUser: CompanyUser; user: User | null }>>> {
    try {
      // バリデーション
      if (!companyId || companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      // 企業に所属するユーザー一覧を取得
      const companyUsers = await this.userRepository.findCompanyUsers(companyId)

      // 各ユーザーの詳細情報を取得
      const result = await Promise.all(
        companyUsers.map(async (companyUser) => {
          const user = await this.userRepository.findById(companyUser.userId)
          return {
            companyUser,
            user,
          }
        })
      )

      return R.success(result)
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


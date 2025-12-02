import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { CompanyUser } from '@/domain/user/entities/company-user'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetCompanyUsersUseCase
 * 企業に所属するユーザー一覧を取得するユースケース
 */
export class GetCompanyUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    companyId: number
  ): Promise<Result<CompanyUser[]>> {
    try {
      // バリデーション
      if (!companyId || companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      const companyUsers = await this.userRepository.findCompanyUsers(companyId)

      return R.success(companyUsers)
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


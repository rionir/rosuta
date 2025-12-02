import { ICompanyRepository } from '@/domain/company/repositories/company-repository'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { Company } from '@/domain/company/entities/company'

/**
 * GetCompanyUseCase
 * 企業情報を取得するユースケース
 */
export class GetCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(companyId: number): Promise<Result<Company>> {
    try {
      // バリデーション
      if (!companyId || companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      const company = await this.companyRepository.findById(companyId)

      if (!company) {
        return R.failure(
          new NotFoundError('企業', companyId)
        )
      }

      return R.success(company)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '企業情報の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


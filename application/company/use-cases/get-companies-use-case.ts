import { ICompanyRepository } from '@/domain/company/repositories/company-repository'
import { Company } from '@/domain/company/entities/company'
import { Result, Result as R } from '@/domain/common/result'
import { DatabaseError } from '@/domain/common/errors'

/**
 * GetCompaniesUseCase
 * 企業一覧を取得するユースケース
 */
export class GetCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(): Promise<Result<Company[]>> {
    try {
      const companies = await this.companyRepository.findAll()

      return R.success(companies)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '企業一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


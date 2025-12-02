import { ICompanyRepository } from '@/domain/company/repositories/company-repository'
import { Company } from '@/domain/company/entities/company'
import { CreateCompanyDTO } from '../dto/create-company-dto'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * CreateCompanyUseCase
 * 企業作成のユースケース
 */
export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(
    dto: CreateCompanyDTO
  ): Promise<Result<Company>> {
    try {
      // バリデーション
      if (!dto.name || dto.name.trim().length === 0) {
        return R.failure(
          new ValidationError('企業名が指定されていません', 'name')
        )
      }

      const company = new Company(
        0, // IDはDBで生成されるため0を設定
        dto.name,
        dto.stripeCustomerId || null,
        dto.plan || 'free',
        dto.status || 'active',
        new Date(),
        new Date()
      )

      const createdCompany = await this.companyRepository.createCompany(company)

      return R.success(createdCompany)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '企業の作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


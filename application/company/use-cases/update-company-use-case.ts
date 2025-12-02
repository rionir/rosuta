import { ICompanyRepository } from '@/domain/company/repositories/company-repository'
import { UpdateCompanyDTO } from '../dto/update-company-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { Company } from '@/domain/company/entities/company'

/**
 * UpdateCompanyUseCase
 * 企業更新のユースケース
 */
export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async execute(
    dto: UpdateCompanyDTO
  ): Promise<Result<Company>> {
    try {
      // バリデーション
      if (!dto.companyId || dto.companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      const company = await this.companyRepository.findById(dto.companyId)

      if (!company) {
        return R.failure(
          new NotFoundError('企業', dto.companyId)
        )
      }

      let updatedCompany = company

      if (dto.name) {
        if (dto.name.trim().length === 0) {
          return R.failure(
            new ValidationError('企業名が空です', 'name')
          )
        }
        updatedCompany = updatedCompany.updateName(dto.name)
      }

      if (dto.stripeCustomerId !== undefined) {
        updatedCompany = updatedCompany.updateStripeCustomerId(
          dto.stripeCustomerId
        )
      }

      if (dto.plan) {
        updatedCompany = updatedCompany.updatePlan(dto.plan)
      }

      if (dto.status) {
        updatedCompany = updatedCompany.updateStatus(dto.status)
      }

      const result = await this.companyRepository.updateCompany(updatedCompany)

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '企業の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


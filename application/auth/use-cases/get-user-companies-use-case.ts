import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { SupabaseClient } from '@supabase/supabase-js'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

/**
 * GetUserCompaniesUseCase
 * ユーザーの企業情報を取得するユースケース
 */
export class GetUserCompaniesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(userId: string): Promise<Result<Array<{ companyUser: any; company: any | null }>>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      // ユーザーの企業所属情報を取得
      const companyUsers = await this.userRepository.findCompanyUsersByUserId(
        userId
      )

      // 企業情報を取得
      const companyIds = companyUsers
        .filter((cu) => cu.isActive)
        .map((cu) => cu.companyId)

      if (companyIds.length === 0) {
        return R.success([])
      }

      const { data: companies, error } = await this.supabase
        .from('companies')
        .select('id, name, plan, status')
        .in('id', companyIds)

      if (error) {
        return R.failure(
          new ExternalServiceError('Supabase', `企業情報の取得に失敗しました: ${error.message}`)
        )
      }

      // 企業所属情報と企業情報をマージ
      const result = companyUsers
        .filter((cu) => cu.isActive)
        .map((cu) => {
          const company = companies?.find((c) => c.id === cu.companyId)
          return {
            companyUser: cu,
            company: company || null,
          }
        })

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザーの企業情報の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


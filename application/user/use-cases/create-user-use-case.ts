import { SupabaseClient } from '@supabase/supabase-js'
import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { User } from '@/domain/user/entities/user'
import { CompanyUser } from '@/domain/user/entities/company-user'
import { Email } from '@/domain/user/value-objects/email'
import { CreateUserDTO } from '../dto/create-user-dto'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, ExternalServiceError } from '@/domain/common/errors'

/**
 * CreateUserUseCase
 * ユーザー作成のユースケース
 * 1. Supabase認証でユーザーを作成
 * 2. usersテーブルにプロフィール情報を追加
 * 3. company_usersテーブルに企業所属情報を追加
 */
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly adminClient: SupabaseClient
  ) {}

  async execute(dto: CreateUserDTO): Promise<Result<{ userId: string }>> {
    try {
      // バリデーション
      if (!dto.email) {
        return R.failure(
          new ValidationError('メールアドレスが指定されていません', 'email')
        )
      }

      if (!dto.password) {
        return R.failure(
          new ValidationError('パスワードが指定されていません', 'password')
        )
      }

      if (!dto.name) {
        return R.failure(
          new ValidationError('名前が指定されていません', 'name')
        )
      }

      if (!dto.companyId || dto.companyId <= 0) {
        return R.failure(
          new ValidationError('企業IDが無効です', 'companyId')
        )
      }

      // 1. メールアドレスのバリデーション
      const email = Email.create(dto.email)

      // 2. Supabase認証でユーザーを作成
      const { data: authData, error: authError } =
        await this.adminClient.auth.admin.createUser({
          email: email.getValue(),
          password: dto.password,
          email_confirm: true,
        })

      if (authError) {
        return R.failure(
          new ExternalServiceError('Supabase Auth', authError.message)
        )
      }

      if (!authData.user) {
        return R.failure(
          new DatabaseError('ユーザーの作成に失敗しました')
        )
      }

      const userId = authData.user.id

      try {
        // 3. 名前をlast_nameとfirst_nameに分割
        const nameParts = dto.name.trim().split(/\s+/)
        const lastName = nameParts[0] || ''
        const firstName = nameParts.slice(1).join(' ') || ''

        // 4. usersテーブルにプロフィール情報を追加
        const user = new User(
          userId,
          lastName,
          firstName,
          new Date(),
          new Date()
        )
        await this.userRepository.createUser(user)

        // 5. company_usersテーブルに企業所属情報を追加
        const companyUser = new CompanyUser(
          0, // IDはDBで生成されるため0を設定
          dto.companyId,
          userId,
          dto.isAdmin ?? false,
          true,
          new Date(),
          new Date()
        )
        await this.userRepository.createCompanyUser(companyUser)

        return R.success({ userId })
      } catch (error) {
        // ロールバック: 認証ユーザーを削除
        await this.adminClient.auth.admin.deleteUser(userId)
        return R.failure(
          new DatabaseError(
            'ユーザーの作成に失敗しました',
            error instanceof Error ? error : new Error(String(error))
          )
        )
      }
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'ユーザーの作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


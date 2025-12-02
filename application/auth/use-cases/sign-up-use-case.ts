import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/domain/auth/services/auth-service'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, ExternalServiceError, DatabaseError } from '@/domain/common/errors'

/**
 * SignUpUseCase
 * サインアップのユースケース
 * Supabase Authで認証ユーザーを作成し、usersテーブルにプロフィール情報を追加
 */
export class SignUpUseCase {
  async execute(dto: { email: string; password: string; name: string }): Promise<Result<{ userId: string }>> {
    try {
      // バリデーション
      if (!dto.email || !dto.password || !dto.name) {
        return R.failure(
          new ValidationError('すべての項目を入力してください', 'credentials')
        )
      }

      if (!AuthService.isValidEmail(dto.email)) {
        return R.failure(
          new ValidationError('有効なメールアドレスを入力してください', 'email')
        )
      }

      if (!AuthService.isValidPassword(dto.password)) {
        return R.failure(
          new ValidationError('パスワードは6文字以上で入力してください', 'password')
        )
      }

      const supabase = await createClient()

      const { data, error } = await supabase.auth.signUp({
        email: dto.email,
        password: dto.password,
        options: {
          data: {
            name: dto.name,
          },
        },
      })

      if (error) {
        return R.failure(
          new ExternalServiceError('Supabase Auth', error.message)
        )
      }

      if (!data.user) {
        return R.failure(
          new DatabaseError('ユーザーの作成に失敗しました')
        )
      }

      // nameをlast_nameとfirst_nameに分割
      const { lastName, firstName } = AuthService.splitName(dto.name)

      // usersテーブルにプロフィール情報を追加
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        last_name: lastName,
        first_name: firstName,
      })

      if (insertError) {
        return R.failure(
          new DatabaseError(
            'ユーザープロフィールの作成に失敗しました',
            insertError
          )
        )
      }

      return R.success({ userId: data.user.id })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'サインアップに失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


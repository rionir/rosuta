import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/domain/auth/services/auth-service'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, AuthenticationError, ExternalServiceError } from '@/domain/common/errors'

/**
 * SignInUseCase
 * サインインのユースケース
 */
export class SignInUseCase {
  async execute(dto: { email: string; password: string }): Promise<Result<{ success: boolean }>> {
    try {
      // バリデーション
      if (!dto.email || !dto.password) {
        return R.failure(
          new ValidationError('メールアドレスとパスワードを入力してください', 'credentials')
        )
      }

      if (!AuthService.isValidEmail(dto.email)) {
        return R.failure(
          new ValidationError('有効なメールアドレスを入力してください', 'email')
        )
      }

      const supabase = await createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return R.failure(
          new AuthenticationError(error.message || 'ログインに失敗しました')
        )
      }

      if (!data.user) {
        return R.failure(
          new AuthenticationError('ログインに失敗しました')
        )
      }

      return R.success({ success: true })
    } catch (err) {
      console.error('Sign in exception:', err)
      return R.failure(
        new ExternalServiceError(
          'Supabase Auth',
          err instanceof Error ? err.message : 'ログインに失敗しました',
          err instanceof Error ? err : new Error(String(err))
        )
      )
    }
  }
}


import { createClient } from '@/lib/supabase/server'
import { Result, Result as R } from '@/domain/common/result'
import { ExternalServiceError } from '@/domain/common/errors'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

/**
 * Supabase usersテーブルのプロフィール情報型
 */
interface UserProfile {
  id: string
  last_name: string
  first_name: string
  created_at: string
  updated_at: string
}

/**
 * GetCurrentUserUseCase
 * 現在のユーザー情報を取得するユースケース
 */
export class GetCurrentUserUseCase {
  async execute(): Promise<Result<{ user: SupabaseAuthUser; profile: UserProfile | null } | null>> {
    try {
      const supabase = await createClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        // 認証されていない場合はnullを返す（エラーではない）
        return R.success(null)
      }

      // usersテーブルからプロフィール情報を取得
      // エラーが発生しても認証は成功しているので続行
      let profile = null
      try {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        profile = profileData
      } catch (profileError) {
        // プロフィール取得エラーは無視（認証は成功している）
        console.error('Profile fetch error:', profileError)
      }

      return R.success({ user, profile })
    } catch (err) {
      // 予期しないエラーの場合のみエラーを返す
      console.error('getCurrentUser error:', err)
      return R.failure(
        new ExternalServiceError(
          'Supabase Auth',
          'ユーザー情報の取得に失敗しました',
          err instanceof Error ? err : new Error(String(err))
        )
      )
    }
  }
}


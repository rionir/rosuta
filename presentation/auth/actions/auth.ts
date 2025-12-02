'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SignInUseCase } from '@/application/auth/use-cases/sign-in-use-case'
import { SignUpUseCase } from '@/application/auth/use-cases/sign-up-use-case'
import { SignOutUseCase } from '@/application/auth/use-cases/sign-out-use-case'
import { GetCurrentUserUseCase } from '@/application/auth/use-cases/get-current-user-use-case'
import { GetUserCompaniesUseCase } from '@/application/auth/use-cases/get-user-companies-use-case'
import { IsUserAdminUseCase } from '@/application/auth/use-cases/is-user-admin-use-case'
import { SupabaseUserRepository } from '@/infrastructure/repositories/user/supabase-user-repository'
import { ErrorHandler } from '@/presentation/common/error-handler'
import { formatUserName } from '@/lib/utils/user-name'
import { CurrentUserDTO } from '@/presentation/auth/dto/current-user-dto'

// 既存のインターフェースを維持（後方互換性）
export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput {
  email: string
  password: string
  name: string
}

/**
 * サインイン
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const useCase = new SignInUseCase()
  const result = await useCase.execute({ email, password })

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * サインアップ
 */
export async function signUp(input: SignUpInput) {
  const useCase = new SignUpUseCase()
  const result = await useCase.execute(input)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  return { data: handled.data }
}

/**
 * サインアウト
 */
export async function signOut() {
  const useCase = new SignOutUseCase()
  await useCase.execute()
  revalidatePath('/', 'layout')
  redirect('/app/login')
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser(): Promise<{ data: CurrentUserDTO | null } | { error: string }> {
  const useCase = new GetCurrentUserUseCase()
  const result = await useCase.execute()
  
  // getCurrentUserは認証されていない場合もnullを返す（エラーではない）
  if (result.success) {
    // nullの場合は{ data: null }を返す（既存のインターフェースとの互換性）
    if (result.data === null) {
      return { data: null }
    }
    // データがある場合はDTOに変換
    const dto: CurrentUserDTO = {
      id: result.data.user.id,
      email: result.data.user.email,
      profile: result.data.profile
        ? {
            last_name: result.data.profile.last_name,
            first_name: result.data.profile.first_name,
            name: formatUserName({
              last_name: result.data.profile.last_name,
              first_name: result.data.profile.first_name,
            }),
          }
        : undefined,
    }
    return { data: dto }
  }
  
  // エラーの場合はnullを返す（既存のインターフェースとの互換性）
  return { data: null }
}

/**
 * ユーザーの企業情報を取得
 */
export async function getUserCompanies(userId: string) {
  const supabase = await createClient()

  const userRepository = new SupabaseUserRepository(supabase)
  const useCase = new GetUserCompaniesUseCase(userRepository, supabase)

  const result = await useCase.execute(userId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: '企業情報の取得に失敗しました' }
  }

  // エンティティをDTOに変換（既存のUIとの互換性）
  const data = handled.data.map(({ companyUser, company }) => ({
    company_id: companyUser.companyId,
    company: company ? {
      id: company.id,
      name: company.name,
      plan: company.plan,
      status: company.status,
    } : null,
  }))

  return { data }
}

/**
 * ユーザーが管理者かどうかを判定
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const userRepository = new SupabaseUserRepository(supabase)
  const useCase = new IsUserAdminUseCase(userRepository)

  return await useCase.execute(userId)
}


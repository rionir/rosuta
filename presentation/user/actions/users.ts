'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { SupabaseUserRepository } from '@/infrastructure/repositories/user/supabase-user-repository'
import { CreateUserUseCase } from '@/application/user/use-cases/create-user-use-case'
import { UpdateUserUseCase } from '@/application/user/use-cases/update-user-use-case'
import { DeleteUserUseCase } from '@/application/user/use-cases/delete-user-use-case'
import { GetCompanyUsersUseCase } from '@/application/user/use-cases/get-company-users-use-case'
import { GetCompanyUsersWithUsersUseCase } from '@/application/user/use-cases/get-company-users-with-users-use-case'
import { CreateUserDTO } from '@/application/user/dto/create-user-dto'
import { UpdateUserDTO } from '@/application/user/dto/update-user-dto'
import { ErrorHandler } from '@/presentation/common/error-handler'
import { CompanyUserDTO } from '@/presentation/user/dto/company-user-dto'

// 既存のインターフェースを維持（後方互換性）
export interface CreateUserInput {
  email: string
  password: string
  name: string
  companyId: number
  isAdmin?: boolean
}

export interface UpdateUserInput {
  userId: string
  name?: string
  isAdmin?: boolean
  isActive?: boolean
}

/**
 * ユーザーを作成（認証 + company_users に追加）
 */
export async function createUser(input: CreateUserInput) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const userRepository = new SupabaseUserRepository(supabase, adminClient)
  const createUserUseCase = new CreateUserUseCase(userRepository, adminClient)

  const dto: CreateUserDTO = {
    email: input.email,
    password: input.password,
    name: input.name,
    companyId: input.companyId,
    isAdmin: input.isAdmin,
  }

  const result = await createUserUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'ユーザーの作成に失敗しました' }
  }

  revalidatePath('/app/admin/users')
  return { data: { userId: handled.data.userId } }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(input: UpdateUserInput) {
  const supabase = await createClient()

  const userRepository = new SupabaseUserRepository(supabase)
  const updateUserUseCase = new UpdateUserUseCase(userRepository)

  const dto: UpdateUserDTO = {
    userId: input.userId,
    name: input.name,
    isAdmin: input.isAdmin,
    isActive: input.isActive,
  }

  const result = await updateUserUseCase.execute(dto)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  revalidatePath('/app/admin/users')
  return { data: { success: true } }
}

/**
 * ユーザーを削除（論理削除）
 */
export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const userRepository = new SupabaseUserRepository(supabase)
  const deleteUserUseCase = new DeleteUserUseCase(userRepository)

  const result = await deleteUserUseCase.execute(userId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'ユーザーの削除に失敗しました' }
  }

  revalidatePath('/app/admin/users')
  return { data: { success: true } }
}

/**
 * 企業に所属するユーザー一覧を取得
 */
export async function getCompanyUsers(companyId: number) {
  const supabase = await createClient()

  const userRepository = new SupabaseUserRepository(supabase)
  const getCompanyUsersWithUsersUseCase = new GetCompanyUsersWithUsersUseCase(userRepository)

  const result = await getCompanyUsersWithUsersUseCase.execute(companyId)

  const handled = ErrorHandler.handleResult(result)
  if (handled.error) {
    return { error: handled.error }
  }

  if (!handled.data) {
    return { error: 'ユーザー一覧の取得に失敗しました' }
  }

  // エンティティをDTOに変換
  const data: CompanyUserDTO[] = handled.data.map(({ companyUser, user }) => ({
    user_id: companyUser.userId,
    is_admin: companyUser.isAdmin,
    is_active: companyUser.isActive,
    created_at: companyUser.createdAt.toISOString(),
    users: user ? {
      id: user.id,
      last_name: user.lastName,
      first_name: user.firstName,
      created_at: user.createdAt.toISOString(),
    } : null,
  }))

  return { data }
}


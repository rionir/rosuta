'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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

  // 1. Supabase認証でユーザーを作成（サービスロールキーが必要）
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // 2. usersテーブルにプロフィール情報を追加
  // nameをlast_nameとfirst_nameに分割（スペースで分割）
  const nameParts = input.name.trim().split(/\s+/)
  const last_name = nameParts[0] || ''
  const first_name = nameParts.slice(1).join(' ') || ''
  
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      last_name,
      first_name,
    })

  if (profileError) {
    // ロールバック: 認証ユーザーを削除
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  // 3. company_usersに追加
  const { error: companyUserError } = await supabase
    .from('company_users')
    .insert({
      company_id: input.companyId,
      user_id: authData.user.id,
      is_admin: input.isAdmin ?? false,
      is_active: true,
    })

  if (companyUserError) {
    // ロールバック: usersと認証ユーザーを削除
    await supabase.from('users').delete().eq('id', authData.user.id)
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: companyUserError.message }
  }

  revalidatePath('/admin/users')
  return { data: { userId: authData.user.id } }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(input: UpdateUserInput) {
  const supabase = await createClient()

  // usersテーブルの更新
  if (input.name) {
    // nameをlast_nameとfirst_nameに分割（スペースで分割）
    const nameParts = input.name.trim().split(/\s+/)
    const last_name = nameParts[0] || ''
    const first_name = nameParts.slice(1).join(' ') || ''
    
    const { error } = await supabase
      .from('users')
      .update({ last_name, first_name })
      .eq('id', input.userId)

    if (error) {
      return { error: error.message }
    }
  }

  // company_usersテーブルの更新
  const updates: { is_admin?: boolean; is_active?: boolean } = {}
  if (input.isAdmin !== undefined) updates.is_admin = input.isAdmin
  if (input.isActive !== undefined) updates.is_active = input.isActive

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('company_users')
      .update(updates)
      .eq('user_id', input.userId)

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/admin/users')
  return { data: { success: true } }
}

/**
 * ユーザーを削除（論理削除）
 */
export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // company_usersから論理削除
  const { error } = await supabase
    .from('company_users')
    .update({ is_active: false })
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { data: { success: true } }
}

/**
 * 企業に所属するユーザー一覧を取得
 */
export async function getCompanyUsers(companyId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_users')
    .select(`
      *,
      users (
        id,
        last_name,
        first_name,
        created_at
      )
    `)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


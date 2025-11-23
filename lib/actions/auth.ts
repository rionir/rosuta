'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'メールアドレスとパスワードを入力してください' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      return { error: error.message || 'ログインに失敗しました' }
    }

    if (!data.user) {
      return { error: 'ログインに失敗しました' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Sign in exception:', err)
    return { error: err instanceof Error ? err.message : 'ログインに失敗しました' }
  }
}

/**
 * サインアップ
 */
export async function signUp(input: SignUpInput) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // usersテーブルにプロフィール情報を追加
    await supabase.from('users').insert({
      id: data.user.id,
      name: input.name,
    })
  }

  return { data }
}

/**
 * サインアウト
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { data: null }
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

    return { data: { ...user, profile } }
  } catch (err) {
    // すべてのエラーをキャッチしてnullを返す
    console.error('getCurrentUser error:', err)
    return { data: null }
  }
}

/**
 * ユーザーの企業情報を取得
 */
export async function getUserCompanies(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_users')
    .select(`
      *,
      companies (
        id,
        name,
        plan,
        status
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * ユーザーが管理者かどうかを判定
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_users')
    .select('is_admin')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('is_admin', true)
    .limit(1)

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return data && data.length > 0
}


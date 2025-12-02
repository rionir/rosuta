import { SupabaseClient } from '@supabase/supabase-js'
import { User } from '@/domain/user/entities/user'
import { CompanyUser } from '@/domain/user/entities/company-user'
import { IUserRepository } from '@/domain/user/repositories/user-repository'

/**
 * SupabaseUserRepository
 * IUserRepositoryのSupabase実装
 */
export class SupabaseUserRepository implements IUserRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly adminClient?: SupabaseClient
  ) {}

  async createUser(user: User): Promise<User> {
    const { error } = await this.supabase.from('users').insert({
      id: user.id,
      last_name: user.lastName,
      first_name: user.firstName,
    })

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    return user
  }

  async updateUser(user: User): Promise<User> {
    const { error } = await this.supabase
      .from('users')
      .update({
        last_name: user.lastName,
        first_name: user.firstName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    return user
  }

  async findById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null
      }
      throw new Error(`Failed to find user: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new User(
      data.id,
      data.last_name || '',
      data.first_name || '',
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async createCompanyUser(companyUser: CompanyUser): Promise<CompanyUser> {
    const { data, error } = await this.supabase
      .from('company_users')
      .insert({
        company_id: companyUser.companyId,
        user_id: companyUser.userId,
        is_admin: companyUser.isAdmin,
        is_active: companyUser.isActive,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create company user: ${error.message}`)
    }

    return new CompanyUser(
      data.id,
      data.company_id,
      data.user_id,
      data.is_admin,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateCompanyUser(companyUser: CompanyUser): Promise<CompanyUser> {
    const { error } = await this.supabase
      .from('company_users')
      .update({
        is_admin: companyUser.isAdmin,
        is_active: companyUser.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyUser.id)

    if (error) {
      throw new Error(`Failed to update company user: ${error.message}`)
    }

    return companyUser
  }

  async findCompanyUsers(companyId: number): Promise<CompanyUser[]> {
    const { data, error } = await this.supabase
      .from('company_users')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find company users: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new CompanyUser(
          item.id,
          item.company_id,
          item.user_id,
          item.is_admin,
          item.is_active,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  /**
   * 企業に所属するユーザー一覧を取得（users情報も含む）
   * 既存のUIとの互換性のため
   */
  async findCompanyUsersWithUsers(companyId: number): Promise<any[]> {
    const { data, error } = await this.supabase
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
      throw new Error(`Failed to find company users: ${error.message}`)
    }

    return data || []
  }

  async findCompanyUserByUserIdAndCompanyId(
    userId: string,
    companyId: number
  ): Promise<CompanyUser | null> {
    const { data, error } = await this.supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(
        `Failed to find company user: ${error.message}`
      )
    }

    if (!data) {
      return null
    }

    return new CompanyUser(
      data.id,
      data.company_id,
      data.user_id,
      data.is_admin,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findCompanyUsersByUserId(userId: string): Promise<CompanyUser[]> {
    const { data, error } = await this.supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(
        `Failed to find company users: ${error.message}`
      )
    }

    return (data || []).map(
      (item: any) =>
        new CompanyUser(
          item.id,
          item.company_id,
          item.user_id,
          item.is_admin,
          item.is_active,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  async updateCompanyUserByUserId(
    userId: string,
    updates: { isAdmin?: boolean; isActive?: boolean }
  ): Promise<void> {
    const updateData: { is_admin?: boolean; is_active?: boolean; updated_at?: string } = {}
    if (updates.isAdmin !== undefined) updateData.is_admin = updates.isAdmin
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    updateData.updated_at = new Date().toISOString()

    const { error } = await this.supabase
      .from('company_users')
      .update(updateData)
      .eq('user_id', userId)

    if (error) {
      throw new Error(
        `Failed to update company user: ${error.message}`
      )
    }
  }
}


import { SupabaseClient } from '@supabase/supabase-js'
import { UserStore } from '@/domain/store/entities/user-store'
import { Store } from '@/domain/store/entities/store'
import { User } from '@/domain/user/entities/user'
import { IUserStoreRepository } from '@/domain/store/repositories/user-store-repository'

/**
 * SupabaseUserStoreRepository
 * IUserStoreRepositoryのSupabase実装
 */
export class SupabaseUserStoreRepository implements IUserStoreRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createUserStore(userStore: UserStore): Promise<UserStore> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .insert({
        user_id: userStore.userId,
        store_id: userStore.storeId,
        is_active: userStore.isActive,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user store: ${error.message}`)
    }

    return new UserStore(
      data.id,
      data.user_id,
      data.store_id,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateUserStore(userStore: UserStore): Promise<UserStore> {
    const { error } = await this.supabase
      .from('user_stores')
      .update({
        is_active: userStore.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userStore.id)

    if (error) {
      throw new Error(`Failed to update user store: ${error.message}`)
    }

    return userStore
  }

  async findByUserIdAndStoreId(
    userId: string,
    storeId: number
  ): Promise<UserStore | null> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .select('*')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(
        `Failed to find user store: ${error.message}`
      )
    }

    if (!data) {
      return null
    }

    return new UserStore(
      data.id,
      data.user_id,
      data.store_id,
      data.is_active,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findUserStores(userId: string): Promise<UserStore[]> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .select(`
        *,
        company_stores (
          id,
          name,
          address,
          company_id
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find user stores: ${error.message}`)
    }

    return (data || []).map(
      (item: any) =>
        new UserStore(
          item.id,
          item.user_id,
          item.store_id,
          item.is_active,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }

  async findStoreUsers(storeId: number): Promise<UserStore[]> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .select(`
        user_id,
        store_id,
        is_active,
        created_at,
        users!user_stores_user_id_fkey (
          id,
          last_name,
          first_name
        )
      `)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find store users: ${error.message}`)
    }

    // UserStoreエンティティとして返す（users情報は別途取得が必要な場合は別メソッドで対応）
    return (data || []).map(
      (item: any) =>
        new UserStore(
          item.id || 0, // IDが含まれていない場合は0を設定
          item.user_id,
          item.store_id,
          item.is_active,
          new Date(item.created_at),
          new Date(item.created_at) // updated_atが含まれていない場合はcreated_atを使用
        )
    )
  }

  async upsertUserStore(userStore: UserStore): Promise<UserStore> {
    // 既存の関連付けを確認
    const existing = await this.findByUserIdAndStoreId(
      userStore.userId,
      userStore.storeId
    )

    if (existing) {
      // 既に存在する場合は更新
      return await this.updateUserStore(
        existing.updateActiveStatus(userStore.isActive)
      )
    } else {
      // 存在しない場合は作成
      return await this.createUserStore(userStore)
    }
  }

  /**
   * ユーザーが所属する店舗一覧を取得（店舗情報も含む）
   */
  async findUserStoresWithStores(userId: string): Promise<Array<{ userStore: UserStore; store: Store | null }>> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .select(`
        id,
        user_id,
        store_id,
        is_active,
        created_at,
        updated_at,
        company_stores (
          id,
          company_id,
          name,
          address,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find user stores: ${error.message}`)
    }

    return (data || []).map((item: {
      id: number
      user_id: string
      store_id: number
      is_active: boolean
      created_at: string
      updated_at: string
      company_stores: Array<{
        id: number
        company_id: number
        name: string
        address: string | null
        created_at: string
        updated_at: string
      }> | {
        id: number
        company_id: number
        name: string
        address: string | null
        created_at: string
        updated_at: string
      } | null
    }) => {
      const userStore = new UserStore(
        item.id,
        item.user_id,
        item.store_id,
        item.is_active,
        new Date(item.created_at),
        new Date(item.updated_at)
      )

      // company_storesが配列の場合、最初の要素を取得（1対1の関係なので）
      const storeData = Array.isArray(item.company_stores) ? item.company_stores[0] || null : item.company_stores
      const store = storeData ? new Store(
        storeData.id,
        storeData.company_id,
        storeData.name,
        storeData.address,
        new Date(storeData.created_at),
        new Date(storeData.updated_at)
      ) : null

      return { userStore, store }
    })
  }

  /**
   * 店舗に所属するユーザー一覧を取得（ユーザー情報も含む）
   */
  async findStoreUsersWithUsers(storeId: number): Promise<Array<{ userStore: UserStore; user: User | null }>> {
    const { data, error } = await this.supabase
      .from('user_stores')
      .select(`
        id,
        user_id,
        store_id,
        is_active,
        created_at,
        updated_at,
        users!user_stores_user_id_fkey (
          id,
          last_name,
          first_name,
          created_at,
          updated_at
        )
      `)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find store users: ${error.message}`)
    }

    return (data || []).map((item: {
      id: number
      user_id: string
      store_id: number
      is_active: boolean
      created_at: string
      updated_at: string
      users: Array<{
        id: string
        last_name: string
        first_name: string
        created_at: string
        updated_at: string
      }> | {
        id: string
        last_name: string
        first_name: string
        created_at: string
        updated_at: string
      } | null
    }) => {
      const userStore = new UserStore(
        item.id,
        item.user_id,
        item.store_id,
        item.is_active,
        new Date(item.created_at),
        new Date(item.updated_at)
      )

      // usersが配列の場合、最初の要素を取得（1対1の関係なので）
      const userData = Array.isArray(item.users) ? item.users[0] || null : item.users
      const user = userData ? new User(
        userData.id,
        userData.last_name,
        userData.first_name,
        new Date(userData.created_at),
        new Date(userData.updated_at)
      ) : null

      return { userStore, user }
    })
  }
}


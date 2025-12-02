import { SupabaseClient } from '@supabase/supabase-js'
import { Store } from '@/domain/store/entities/store'
import { IStoreRepository } from '@/domain/store/repositories/store-repository'

/**
 * Supabaseから取得するcompany_storesテーブルのレコード型
 */
interface StoreRow {
  id: number
  company_id: number
  name: string
  address: string | null
  created_at: string
  updated_at: string
}

/**
 * SupabaseStoreRepository
 * IStoreRepositoryのSupabase実装
 */
export class SupabaseStoreRepository implements IStoreRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createStore(store: Store): Promise<Store> {
    const { data, error } = await this.supabase
      .from('company_stores')
      .insert({
        company_id: store.companyId,
        name: store.name,
        address: store.address,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create store: ${error.message}`)
    }

    return new Store(
      data.id,
      data.company_id,
      data.name,
      data.address,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async updateStore(store: Store): Promise<Store> {
    const { error } = await this.supabase
      .from('company_stores')
      .update({
        name: store.name,
        address: store.address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id)

    if (error) {
      throw new Error(`Failed to update store: ${error.message}`)
    }

    return store
  }

  async findById(storeId: number): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from('company_stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find store: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new Store(
      data.id,
      data.company_id,
      data.name,
      data.address,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }

  async findCompanyStores(companyId: number): Promise<Store[]> {
    const { data, error } = await this.supabase
      .from('company_stores')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find company stores: ${error.message}`)
    }

    return (data || []).map(
      (item: StoreRow) =>
        new Store(
          item.id,
          item.company_id,
          item.name,
          item.address,
          new Date(item.created_at),
          new Date(item.updated_at)
        )
    )
  }
}


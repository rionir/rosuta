import { SupabaseClient } from '@supabase/supabase-js'
import { StoreSettings } from '@/domain/store-settings/entities/store-settings'
import { IStoreSettingsRepository } from '@/domain/store-settings/repositories/store-settings-repository'

/**
 * SupabaseStoreSettingsRepository
 * IStoreSettingsRepositoryのSupabase実装
 */
export class SupabaseStoreSettingsRepository
  implements IStoreSettingsRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async updateStoreSettings(settings: StoreSettings): Promise<StoreSettings> {
    const { error } = await this.supabase
      .from('store_settings')
      .update({
        approval_required: settings.approvalRequired,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', settings.storeId)

    if (error) {
      throw new Error(`Failed to update store settings: ${error.message}`)
    }

    return settings
  }

  async findByStoreId(storeId: number): Promise<StoreSettings | null> {
    const { data, error } = await this.supabase
      .from('store_settings')
      .select('*')
      .eq('store_id', storeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find store settings: ${error.message}`)
    }

    if (!data) {
      return null
    }

    return new StoreSettings(
      data.id,
      data.store_id,
      data.approval_required,
      new Date(data.created_at),
      new Date(data.updated_at)
    )
  }
}


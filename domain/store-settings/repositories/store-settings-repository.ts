import { StoreSettings } from '../entities/store-settings'

/**
 * StoreSettingsリポジトリインターフェース
 * 店舗設定の永続化を抽象化
 */
export interface IStoreSettingsRepository {
  /**
   * 店舗設定を更新
   */
  updateStoreSettings(settings: StoreSettings): Promise<StoreSettings>

  /**
   * 店舗IDで店舗設定を取得
   */
  findByStoreId(storeId: number): Promise<StoreSettings | null>
}


import { Store } from '../entities/store'

/**
 * Storeリポジトリインターフェース
 * 店舗の永続化を抽象化
 */
export interface IStoreRepository {
  /**
   * 店舗を作成
   */
  createStore(store: Store): Promise<Store>

  /**
   * 店舗を更新
   */
  updateStore(store: Store): Promise<Store>

  /**
   * 店舗IDで店舗を取得
   */
  findById(storeId: number): Promise<Store | null>

  /**
   * 企業IDで店舗一覧を取得
   */
  findCompanyStores(companyId: number): Promise<Store[]>
}


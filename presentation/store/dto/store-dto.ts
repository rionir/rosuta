/**
 * StoreDTO
 * 店舗の表示用データ転送オブジェクト
 */
export interface StoreDTO {
  id: number
  company_id: number
  name: string
  address: string | null
  created_at: string
  updated_at: string
}

/**
 * UserStoreDTO
 * ユーザー店舗関連の表示用データ転送オブジェクト
 */
export interface UserStoreDTO {
  user_id: string
  store_id: number
  is_active: boolean
  created_at: string
  users: {
    id: string
    last_name: string
    first_name: string
  } | null
}

/**
 * UserStoreWithStoreDTO
 * ユーザー店舗関連（店舗情報含む）の表示用データ転送オブジェクト
 */
export interface UserStoreWithStoreDTO {
  id: number
  user_id: string
  store_id: number
  is_active: boolean
  created_at: string
  updated_at: string
  company_stores: {
    id: number
    company_id: number
    name: string
    address: string | null
  } | null
}


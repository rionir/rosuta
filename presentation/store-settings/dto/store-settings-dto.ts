/**
 * StoreSettingsDTO
 * 店舗設定の表示用データ転送オブジェクト
 */
export interface StoreSettingsDTO {
  id: number
  store_id: number
  approval_required: boolean
  created_at: string
  updated_at: string
}


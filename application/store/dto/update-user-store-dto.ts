/**
 * UpdateUserStoreDTO
 * ユーザーの店舗所属を更新する入力データ
 */
export interface UpdateUserStoreDTO {
  userId: string
  storeId: number
  isActive: boolean
}


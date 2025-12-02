/**
 * CopyShiftsDTO
 * シフトコピーの入力データ
 */
export interface CopyShiftsDTO {
  userId: string // 操作者（管理者）
  sourceDate: string // YYYY-MM-DD
  targetDate: string // YYYY-MM-DD
  storeId?: number // 店舗指定（オプション）
  overwrite: boolean // 既存シフトを上書きするか
}


/**
 * CreateShiftDTO
 * シフト作成の入力データ
 */
export interface CreateShiftDTO {
  userId: string
  storeId: number
  scheduledStart: string // ISO 8601 TIMESTAMP
  scheduledEnd: string // ISO 8601 TIMESTAMP
  createdBy: string
}


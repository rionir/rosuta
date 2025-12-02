/**
 * CreateShiftBreakDTO
 * 休憩作成の入力データ
 */
export interface CreateShiftBreakDTO {
  shiftId: number
  breakStart: string // ISO 8601 TIMESTAMP
  breakEnd: string // ISO 8601 TIMESTAMP
}


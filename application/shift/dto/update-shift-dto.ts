/**
 * UpdateShiftDTO
 * シフト更新の入力データ
 */
export interface UpdateShiftDTO {
  shiftId: number
  scheduledStart?: string
  scheduledEnd?: string
}


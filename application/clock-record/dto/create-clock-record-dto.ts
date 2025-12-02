/**
 * CreateClockRecordDTO
 * 打刻記録作成の入力データ
 */
export interface CreateClockRecordDTO {
  userId: string
  storeId: number
  shiftId?: number
  breakId?: number
  type: string // 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
  selectedTime: string // ISO timestamp
  actualTime: string // ISO timestamp
  method: string // 'scheduled' | 'current' | 'manual'
  createdBy: string
}


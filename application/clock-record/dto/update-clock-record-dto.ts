/**
 * UpdateClockRecordDTO
 * 打刻記録更新の入力データ
 */
export interface UpdateClockRecordDTO {
  recordId: number
  selectedTime?: string
  status?: string // 'pending' | 'approved' | 'rejected'
  approvedBy?: string
}


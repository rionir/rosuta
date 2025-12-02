/**
 * ShiftDTO
 * シフトの表示用データ転送オブジェクト
 */
export interface ShiftDTO {
  id: number
  user_id: string
  store_id: number
  scheduled_start: string
  scheduled_end: string
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * ShiftBreakDTO
 * 休憩の表示用データ転送オブジェクト
 */
export interface ShiftBreakDTO {
  id: number
  shift_id: number
  break_start: string
  break_end: string
  created_at: string
  updated_at: string
}


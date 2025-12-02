/**
 * ClockRecordDTO
 * 打刻記録の表示用データ転送オブジェクト
 */
export interface ClockRecordDTO {
  id: number
  user_id: string
  store_id: number
  shift_id: number | null
  break_id: number | null
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
  selected_time: string
  actual_time: string
  method: 'scheduled' | 'current' | 'manual'
  status: 'pending' | 'approved' | 'rejected'
  created_by: string
  approved_by: string | null
  created_at: string
  updated_at: string
}

/**
 * ClockRecordWithStoreDTO
 * 打刻記録（店舗情報含む）の表示用データ転送オブジェクト
 */
export interface ClockRecordWithStoreDTO extends ClockRecordDTO {
  company_stores: {
    id: number
    name: string
  } | null
}

/**
 * ClockRecordWithUserDTO
 * 打刻記録（ユーザー情報含む）の表示用データ転送オブジェクト
 */
export interface ClockRecordWithUserDTO extends ClockRecordDTO {
  users: {
    id: string
    last_name: string
    first_name: string
  } | null
}


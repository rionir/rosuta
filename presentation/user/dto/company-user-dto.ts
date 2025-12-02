/**
 * CompanyUserDTO
 * 企業ユーザー関連の表示用データ転送オブジェクト
 */
export interface CompanyUserDTO {
  user_id: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  users: {
    id: string
    last_name: string
    first_name: string
    created_at: string
  } | null
}


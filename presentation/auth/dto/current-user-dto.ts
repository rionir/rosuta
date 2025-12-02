/**
 * CurrentUserDTO
 * 現在のユーザー情報の表示用データ転送オブジェクト
 */
export interface CurrentUserDTO {
  id: string
  email?: string
  profile?: {
    last_name: string
    first_name: string
    name?: string // フォーマット済みの名前（後方互換性のため）
  }
}


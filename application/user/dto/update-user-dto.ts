/**
 * UpdateUserDTO
 * ユーザー更新の入力データ
 */
export interface UpdateUserDTO {
  userId: string
  last_name?: string
  first_name?: string
  isAdmin?: boolean
  isActive?: boolean
}


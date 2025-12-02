/**
 * UpdateUserDTO
 * ユーザー更新の入力データ
 */
export interface UpdateUserDTO {
  userId: string
  name?: string
  isAdmin?: boolean
  isActive?: boolean
}


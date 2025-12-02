/**
 * CreateUserDTO
 * ユーザー作成の入力データ
 */
export interface CreateUserDTO {
  email: string
  password: string
  name: string
  companyId: number
  isAdmin?: boolean
}


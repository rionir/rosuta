/**
 * CreateUserDTO
 * ユーザー作成の入力データ
 */
export interface CreateUserDTO {
  email: string
  password: string
  last_name: string
  first_name: string
  companyId: number
  isAdmin?: boolean
}


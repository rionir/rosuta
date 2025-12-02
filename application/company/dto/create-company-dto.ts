/**
 * CreateCompanyDTO
 * 企業作成の入力データ
 */
export interface CreateCompanyDTO {
  name: string
  stripeCustomerId?: string
  plan?: string
  status?: string
}


/**
 * UpdateCompanyDTO
 * 企業更新の入力データ
 */
export interface UpdateCompanyDTO {
  companyId: number
  name?: string
  stripeCustomerId?: string
  plan?: string
  status?: string
}


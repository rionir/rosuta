/**
 * CompanyDTO
 * 企業の表示用データ転送オブジェクト
 */
export interface CompanyDTO {
  id: number
  name: string
  stripe_customer_id: string | null
  plan: string
  status: string
  created_at: string
  updated_at: string
}


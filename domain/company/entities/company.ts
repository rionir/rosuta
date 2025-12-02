import type { CompanyDTO } from '@/presentation/company/dto/company-dto'

/**
 * Companyエンティティ
 * 企業・事業所を表す
 */
export class Company {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly stripeCustomerId: string | null,
    public readonly plan: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 企業名を更新
   */
  updateName(name: string): Company {
    return new Company(
      this.id,
      name,
      this.stripeCustomerId,
      this.plan,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  /**
   * Stripe顧客IDを更新
   */
  updateStripeCustomerId(stripeCustomerId: string | null): Company {
    return new Company(
      this.id,
      this.name,
      stripeCustomerId,
      this.plan,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  /**
   * プランを更新
   */
  updatePlan(plan: string): Company {
    return new Company(
      this.id,
      this.name,
      this.stripeCustomerId,
      plan,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  /**
   * ステータスを更新
   */
  updateStatus(status: string): Company {
    return new Company(
      this.id,
      this.name,
      this.stripeCustomerId,
      this.plan,
      status,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): CompanyDTO {
    return {
      id: this.id,
      name: this.name,
      stripe_customer_id: this.stripeCustomerId,
      plan: this.plan,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


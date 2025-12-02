import type { StoreDTO } from '@/presentation/store/dto/store-dto'

/**
 * Storeエンティティ
 * 店舗を表す
 */
export class Store {
  constructor(
    public readonly id: number,
    public readonly companyId: number,
    public readonly name: string,
    public readonly address: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 店舗名を更新
   */
  updateName(name: string): Store {
    return new Store(
      this.id,
      this.companyId,
      name,
      this.address,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 住所を更新
   */
  updateAddress(address: string | null): Store {
    return new Store(
      this.id,
      this.companyId,
      this.name,
      address,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): StoreDTO {
    return {
      id: this.id,
      company_id: this.companyId,
      name: this.name,
      address: this.address,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


/**
 * StoreSettingsエンティティ
 * 店舗設定を表す
 */
export interface StoreSettingsDTO {
  id: number
  store_id: number
  approval_required: boolean
  created_at: string
  updated_at: string
}

export class StoreSettings {
  constructor(
    public readonly id: number,
    public readonly storeId: number,
    public readonly approvalRequired: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 承認必須フラグを更新
   */
  updateApprovalRequired(approvalRequired: boolean): StoreSettings {
    return new StoreSettings(
      this.id,
      this.storeId,
      approvalRequired,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): StoreSettingsDTO {
    return {
      id: this.id,
      store_id: this.storeId,
      approval_required: this.approvalRequired,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


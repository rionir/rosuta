/**
 * CompanyUserエンティティ
 * 企業ごとのユーザー所属情報を表す
 */
export class CompanyUser {
  constructor(
    public readonly id: number,
    public readonly companyId: number,
    public readonly userId: string,
    public readonly isAdmin: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 管理者権限を更新
   */
  updateAdminStatus(isAdmin: boolean): CompanyUser {
    return new CompanyUser(
      this.id,
      this.companyId,
      this.userId,
      isAdmin,
      this.isActive,
      this.createdAt,
      new Date()
    )
  }

  /**
   * アクティブ状態を更新
   */
  updateActiveStatus(isActive: boolean): CompanyUser {
    return new CompanyUser(
      this.id,
      this.companyId,
      this.userId,
      this.isAdmin,
      isActive,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 論理削除（isActiveをfalseに設定）
   */
  deactivate(): CompanyUser {
    return this.updateActiveStatus(false)
  }
}


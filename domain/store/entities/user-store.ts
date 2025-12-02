/**
 * UserStoreエンティティ
 * スタッフの店舗所属情報を表す
 */
export class UserStore {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly storeId: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * アクティブ状態を更新
   */
  updateActiveStatus(isActive: boolean): UserStore {
    return new UserStore(
      this.id,
      this.userId,
      this.storeId,
      isActive,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 論理削除（isActiveをfalseに設定）
   */
  deactivate(): UserStore {
    return this.updateActiveStatus(false)
  }

  /**
   * 有効化（isActiveをtrueに設定）
   */
  activate(): UserStore {
    return this.updateActiveStatus(true)
  }
}


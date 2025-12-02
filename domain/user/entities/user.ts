import type { UserDTO } from '@/presentation/user/dto/user-dto'

/**
 * Userエンティティ
 * Supabase認証ユーザーのプロフィール情報を表す
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly lastName: string,
    public readonly firstName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * フルネームを取得
   */
  get fullName(): string {
    return `${this.lastName} ${this.firstName}`.trim()
  }

  /**
   * 名前を更新
   */
  updateName(lastName: string, firstName: string): User {
    return new User(
      this.id,
      lastName,
      firstName,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): UserDTO {
    return {
      id: this.id,
      last_name: this.lastName,
      first_name: this.firstName,
    }
  }
}


/**
 * Email値オブジェクト
 * メールアドレスのバリデーションと不変性を保証
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email address')
    }
  }

  /**
   * Emailインスタンスを作成
   */
  static create(value: string): Email {
    return new Email(value)
  }

  /**
   * メールアドレスの妥当性をチェック
   */
  private isValid(email: string): boolean {
    return Email.EMAIL_REGEX.test(email)
  }

  /**
   * メールアドレスを文字列として取得
   */
  toString(): string {
    return this.value
  }

  /**
   * メールアドレスを取得
   */
  getValue(): string {
    return this.value
  }
}


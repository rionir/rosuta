/**
 * AuthService
 * 認証に関するドメインサービス（ビジネスロジック）
 */
export class AuthService {
  /**
   * フルネームをlast_nameとfirst_nameに分割
   * スペースで分割し、最初の部分をlast_name、残りをfirst_nameとする
   */
  static splitName(fullName: string): { lastName: string; firstName: string } {
    const trimmed = fullName.trim()
    if (!trimmed) {
      return { lastName: '', firstName: '' }
    }

    const parts = trimmed.split(/\s+/)
    const lastName = parts[0] || ''
    const firstName = parts.slice(1).join(' ') || ''

    return { lastName, firstName }
  }

  /**
   * メールアドレスのバリデーション
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * パスワードの最小要件チェック
   */
  static isValidPassword(password: string): boolean {
    // 最低6文字以上
    return password.length >= 6
  }
}


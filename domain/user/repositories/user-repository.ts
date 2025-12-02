import { User } from '../entities/user'
import { CompanyUser } from '../entities/company-user'

/**
 * Userリポジトリインターフェース
 * ユーザーと企業所属情報の永続化を抽象化
 */
export interface IUserRepository {
  /**
   * ユーザーを作成
   */
  createUser(user: User): Promise<User>

  /**
   * ユーザーを更新
   */
  updateUser(user: User): Promise<User>

  /**
   * ユーザーIDでユーザーを取得
   */
  findById(userId: string): Promise<User | null>

  /**
   * 企業所属情報を作成
   */
  createCompanyUser(companyUser: CompanyUser): Promise<CompanyUser>

  /**
   * 企業所属情報を更新
   */
  updateCompanyUser(companyUser: CompanyUser): Promise<CompanyUser>

  /**
   * 企業IDで企業所属ユーザー一覧を取得
   */
  findCompanyUsers(companyId: number): Promise<CompanyUser[]>

  /**
   * ユーザーIDと企業IDで企業所属情報を取得
   */
  findCompanyUserByUserIdAndCompanyId(
    userId: string,
    companyId: number
  ): Promise<CompanyUser | null>

  /**
   * ユーザーIDで企業所属情報を取得（複数企業に所属する場合を考慮）
   */
  findCompanyUsersByUserId(userId: string): Promise<CompanyUser[]>

  /**
   * ユーザーIDで企業所属情報を更新（user_idで直接更新）
   */
  updateCompanyUserByUserId(
    userId: string,
    updates: { isAdmin?: boolean; isActive?: boolean }
  ): Promise<void>
}


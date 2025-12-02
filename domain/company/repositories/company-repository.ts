import { Company } from '../entities/company'

/**
 * Companyリポジトリインターフェース
 * 企業の永続化を抽象化
 */
export interface ICompanyRepository {
  /**
   * 企業を作成
   */
  createCompany(company: Company): Promise<Company>

  /**
   * 企業を更新
   */
  updateCompany(company: Company): Promise<Company>

  /**
   * 企業IDで企業を取得
   */
  findById(companyId: number): Promise<Company | null>

  /**
   * 企業一覧を取得
   */
  findAll(): Promise<Company[]>
}


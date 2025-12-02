import { IUserRepository } from '@/domain/user/repositories/user-repository'

/**
 * IsUserAdminUseCase
 * ユーザーが管理者かどうかを判定するユースケース
 */
export class IsUserAdminUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<boolean> {
    try {
      // ユーザーの企業所属情報を取得
      const companyUsers = await this.userRepository.findCompanyUsersByUserId(
        userId
      )

      // アクティブな企業所属情報で、isAdminがtrueのものがあるかチェック
      return companyUsers.some((cu) => cu.isActive && cu.isAdmin)
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }
}


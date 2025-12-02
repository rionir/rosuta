import { UserStore } from '../entities/user-store'
import { User } from '@/domain/user/entities/user'
import { Store } from '../entities/store'

/**
 * UserStoreリポジトリインターフェース
 * スタッフの店舗所属情報の永続化を抽象化
 */
export interface IUserStoreRepository {
  /**
   * ユーザーと店舗の関連付けを作成
   */
  createUserStore(userStore: UserStore): Promise<UserStore>

  /**
   * ユーザーと店舗の関連付けを更新
   */
  updateUserStore(userStore: UserStore): Promise<UserStore>

  /**
   * ユーザーIDと店舗IDで関連付けを取得
   */
  findByUserIdAndStoreId(
    userId: string,
    storeId: number
  ): Promise<UserStore | null>

  /**
   * ユーザーIDで店舗一覧を取得
   */
  findUserStores(userId: string): Promise<UserStore[]>

  /**
   * 店舗IDでユーザー一覧を取得
   */
  findStoreUsers(storeId: number): Promise<UserStore[]>

  /**
   * ユーザーIDと店舗IDで関連付けを更新（存在しない場合は作成）
   */
  upsertUserStore(userStore: UserStore): Promise<UserStore>

  /**
   * 店舗に所属するユーザー一覧を取得（ユーザー情報も含む）
   */
  findStoreUsersWithUsers(storeId: number): Promise<Array<{ userStore: UserStore; user: User | null }>>

  /**
   * ユーザーが所属する店舗一覧を取得（店舗情報も含む）
   */
  findUserStoresWithStores(userId: string): Promise<Array<{ userStore: UserStore; store: Store | null }>>
}


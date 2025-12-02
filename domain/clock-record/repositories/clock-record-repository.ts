import { ClockRecord } from '../entities/clock-record'
import { ClockRecordStatus } from '../value-objects/clock-record-status'
import { Store } from '@/domain/store/entities/store'
import { User } from '@/domain/user/entities/user'

/**
 * ClockRecordリポジトリインターフェース
 * 打刻記録の永続化を抽象化
 */
export interface IClockRecordRepository {
  /**
   * 打刻記録を作成
   */
  createClockRecord(clockRecord: ClockRecord): Promise<ClockRecord>

  /**
   * 打刻記録を更新
   */
  updateClockRecord(clockRecord: ClockRecord): Promise<ClockRecord>

  /**
   * 打刻記録IDで打刻記録を取得
   */
  findById(recordId: number): Promise<ClockRecord | null>

  /**
   * ユーザーの打刻記録一覧を取得（日付範囲指定）
   */
  findUserClockRecords(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<ClockRecord[]>

  /**
   * 店舗の打刻記録一覧を取得（日付範囲指定）
   */
  findStoreClockRecords(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<ClockRecord[]>

  /**
   * 承認待ちの打刻記録一覧を取得
   */
  findPendingClockRecords(storeId: number): Promise<ClockRecord[]>

  /**
   * ユーザーの今日の打刻記録を取得（承認済み）
   */
  findTodayApprovedClockRecords(
    userId: string,
    storeId: number,
    date: Date
  ): Promise<ClockRecord[]>

  /**
   * ユーザーの今日の打刻記録を取得（承認待ち）
   */
  findTodayPendingClockRecords(
    userId: string,
    storeId: number,
    date: Date
  ): Promise<ClockRecord[]>

  /**
   * ユーザーの打刻記録一覧を取得（店舗情報も含む）
   */
  findUserClockRecordsWithStores(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<Array<{ clockRecord: ClockRecord; store: Store | null }>>

  /**
   * 店舗の打刻記録一覧を取得（ユーザー情報も含む）
   */
  findStoreClockRecordsWithUsers(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ clockRecord: ClockRecord; user: User | null }>>
}


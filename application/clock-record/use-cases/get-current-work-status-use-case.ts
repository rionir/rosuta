import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { ClockRecordService } from '@/domain/clock-record/services/clock-record-service'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetCurrentWorkStatusUseCase
 * ユーザーの現在の勤務ステータスを取得するユースケース
 */
export class GetCurrentWorkStatusUseCase {
  constructor(private readonly clockRecordRepository: IClockRecordRepository) {}

  async execute(
    userId: string,
    storeId: number
  ): Promise<Result<{
    status: 'before_work' | 'working' | 'on_break' | 'finished'
    lastRecord: ClockRecord | null
    records: Array<ClockRecord>
  }>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 承認済みのレコードを取得
      const approvedRecords =
        await this.clockRecordRepository.findTodayApprovedClockRecords(
          userId,
          storeId,
          today
        )

      // 承認待ちのレコードを取得
      const pendingRecords =
        await this.clockRecordRepository.findTodayPendingClockRecords(
          userId,
          storeId,
          today
        )

      // 最新のレコードを決定（承認済みを優先）
      const lastRecord = approvedRecords[0] || pendingRecords[0] || null

      // ステータスを判定
      const status = ClockRecordService.determineWorkStatus(
        lastRecord
          ? {
              type: lastRecord.type,
              status: lastRecord.status,
            }
          : null
      )

      // レコードをDTO形式に変換
      const allRecords = [...approvedRecords, ...pendingRecords]

      return R.success({
        status,
        lastRecord: lastRecord,
        records: allRecords,
      })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '勤務ステータスの取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


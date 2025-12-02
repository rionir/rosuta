import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { Store } from '@/domain/store/entities/store'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetUserClockRecordsUseCase
 * ユーザーの打刻記録一覧を取得するユースケース
 */
export class GetUserClockRecordsUseCase {
  constructor(private readonly clockRecordRepository: IClockRecordRepository) {}

  async execute(
    userId: string,
    startDate: string,
    endDate: string,
    storeId?: number
  ): Promise<Result<Array<{ clockRecord: ClockRecord; store: Store | null }>>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!startDate || !endDate) {
        return R.failure(
          new ValidationError('開始日と終了日を指定してください', 'dateRange')
        )
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return R.failure(
          new ValidationError('無効な日付形式です', 'dateRange')
        )
      }

      if (start > end) {
        return R.failure(
          new ValidationError('開始日が終了日より後になっています', 'dateRange')
        )
      }

      const data = await this.clockRecordRepository.findUserClockRecordsWithStores(
        userId,
        start,
        end,
        storeId
      )

      return R.success(data)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '打刻記録一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


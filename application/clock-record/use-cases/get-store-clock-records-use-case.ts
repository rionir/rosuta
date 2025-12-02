import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { User } from '@/domain/user/entities/user'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetStoreClockRecordsUseCase
 * 店舗の打刻記録一覧を取得するユースケース
 */
export class GetStoreClockRecordsUseCase {
  constructor(private readonly clockRecordRepository: IClockRecordRepository) {}

  async execute(
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<Result<Array<{ clockRecord: ClockRecord; user: User | null }>>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
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

      const data = await this.clockRecordRepository.findStoreClockRecordsWithUsers(
        storeId,
        start,
        end
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


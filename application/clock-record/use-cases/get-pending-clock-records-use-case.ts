import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { IUserRepository } from '@/domain/user/repositories/user-repository'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'
import { User } from '@/domain/user/entities/user'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetPendingClockRecordsUseCase
 * 承認待ちの打刻記録一覧を取得するユースケース
 */
export class GetPendingClockRecordsUseCase {
  constructor(
    private readonly clockRecordRepository: IClockRecordRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(storeId: number): Promise<Result<Array<{ clockRecord: ClockRecord; user: User | null }>>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      const clockRecords = await this.clockRecordRepository.findPendingClockRecords(
        storeId
      )

      // 各打刻記録のユーザー情報を取得
      const results = await Promise.all(
        clockRecords.map(async (clockRecord) => {
          const user = await this.userRepository.findById(clockRecord.userId)
          return { clockRecord, user }
        })
      )

      return R.success(results)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '承認待ち打刻記録一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


import { IClockRecordRepository } from '@/domain/clock-record/repositories/clock-record-repository'
import { createClockRecordStatus } from '@/domain/clock-record/value-objects/clock-record-status'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'
import { ClockRecord } from '@/domain/clock-record/entities/clock-record'

/**
 * ApproveClockRecordUseCase
 * 打刻記録を承認/却下するユースケース
 */
export class ApproveClockRecordUseCase {
  constructor(private readonly clockRecordRepository: IClockRecordRepository) {}

  async execute(
    recordId: number,
    status: 'approved' | 'rejected',
    approvedBy: string
  ): Promise<Result<ClockRecord>> {
    try {
      // バリデーション
      if (!recordId || recordId <= 0) {
        return R.failure(
          new ValidationError('打刻記録IDが無効です', 'recordId')
        )
      }

      if (!approvedBy) {
        return R.failure(
          new ValidationError('承認者IDが指定されていません', 'approvedBy')
        )
      }

      const existingRecord = await this.clockRecordRepository.findById(recordId)

      if (!existingRecord) {
        return R.failure(
          new NotFoundError('打刻記録', recordId)
        )
      }

      const newStatus = createClockRecordStatus(status)
      const updatedRecord = existingRecord.updateStatus(newStatus, approvedBy)

      const result = await this.clockRecordRepository.updateClockRecord(
        updatedRecord
      )

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '打刻記録の承認/却下に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


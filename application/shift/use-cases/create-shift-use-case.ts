import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Shift } from '@/domain/shift/entities/shift'
import { CreateShiftDTO } from '../dto/create-shift-dto'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, BusinessLogicError } from '@/domain/common/errors'

/**
 * CreateShiftUseCase
 * シフト作成のユースケース
 */
export class CreateShiftUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(dto: CreateShiftDTO): Promise<Result<Shift>> {
    try {
      // バリデーション
      if (!dto.userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!dto.storeId || dto.storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
        )
      }

      if (!dto.scheduledStart || !dto.scheduledEnd) {
        return R.failure(
          new ValidationError('開始時刻と終了時刻を指定してください', 'scheduledTime')
        )
      }

      const start = new Date(dto.scheduledStart)
      const end = new Date(dto.scheduledEnd)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return R.failure(
          new ValidationError('無効な日時形式です', 'scheduledTime')
        )
      }

      if (start >= end) {
        return R.failure(
          new BusinessLogicError('開始時刻は終了時刻より前である必要があります')
        )
      }

      if (!dto.createdBy) {
        return R.failure(
          new ValidationError('作成者IDが指定されていません', 'createdBy')
        )
      }

      const shift = new Shift(
        0, // IDはDBで生成されるため0を設定
        dto.userId,
        dto.storeId,
        start,
        end,
        dto.createdBy,
        new Date(),
        new Date()
      )

      const createdShift = await this.shiftRepository.createShift(shift)

      return R.success(createdShift)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'シフトの作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


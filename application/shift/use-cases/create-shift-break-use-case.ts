import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { ShiftBreak } from '@/domain/shift/entities/shift-break'
import { CreateShiftBreakDTO } from '../dto/create-shift-break-dto'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError, BusinessLogicError } from '@/domain/common/errors'

/**
 * CreateShiftBreakUseCase
 * 休憩作成のユースケース
 */
export class CreateShiftBreakUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(
    dto: CreateShiftBreakDTO
  ): Promise<Result<ShiftBreak>> {
    try {
      // バリデーション
      if (!dto.shiftId || dto.shiftId <= 0) {
        return R.failure(
          new ValidationError('シフトIDが無効です', 'shiftId')
        )
      }

      if (!dto.breakStart || !dto.breakEnd) {
        return R.failure(
          new ValidationError('開始時刻と終了時刻を指定してください', 'breakTime')
        )
      }

      const start = new Date(dto.breakStart)
      const end = new Date(dto.breakEnd)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return R.failure(
          new ValidationError('無効な日時形式です', 'breakTime')
        )
      }

      if (start >= end) {
        return R.failure(
          new BusinessLogicError('開始時刻は終了時刻より前である必要があります')
        )
      }

      const shiftBreak = new ShiftBreak(
        0, // IDはDBで生成されるため0を設定
        dto.shiftId,
        start,
        end,
        new Date(),
        new Date()
      )

      const createdBreak = await this.shiftRepository.createShiftBreak(shiftBreak)

      return R.success(createdBreak)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '休憩の作成に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


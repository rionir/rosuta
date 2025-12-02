import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { UpdateShiftDTO } from '../dto/update-shift-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError, BusinessLogicError } from '@/domain/common/errors'
import { Shift } from '@/domain/shift/entities/shift'

/**
 * UpdateShiftUseCase
 * シフト更新のユースケース
 */
export class UpdateShiftUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(
    dto: UpdateShiftDTO
  ): Promise<Result<Shift>> {
    try {
      // バリデーション
      if (!dto.shiftId || dto.shiftId <= 0) {
        return R.failure(
          new ValidationError('シフトIDが無効です', 'shiftId')
        )
      }

      const shift = await this.shiftRepository.findById(dto.shiftId)

      if (!shift) {
        return R.failure(
          new NotFoundError('シフト', dto.shiftId)
        )
      }

      let updatedShift = shift

      if (dto.scheduledStart) {
        const start = new Date(dto.scheduledStart)
        if (isNaN(start.getTime())) {
          return R.failure(
            new ValidationError('無効な開始時刻形式です', 'scheduledStart')
          )
        }
        updatedShift = updatedShift.updateScheduledStart(start)
      }

      if (dto.scheduledEnd) {
        const end = new Date(dto.scheduledEnd)
        if (isNaN(end.getTime())) {
          return R.failure(
            new ValidationError('無効な終了時刻形式です', 'scheduledEnd')
          )
        }
        updatedShift = updatedShift.updateScheduledEnd(end)
      }

      // 開始時刻と終了時刻の整合性チェック
      if (updatedShift.scheduledStart >= updatedShift.scheduledEnd) {
        return R.failure(
          new BusinessLogicError('開始時刻は終了時刻より前である必要があります')
        )
      }

      const result = await this.shiftRepository.updateShift(updatedShift)

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'シフトの更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


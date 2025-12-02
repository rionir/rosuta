import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { UpdateShiftBreakDTO } from '../dto/update-shift-break-dto'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError, BusinessLogicError } from '@/domain/common/errors'
import { ShiftBreak } from '@/domain/shift/entities/shift-break'

/**
 * UpdateShiftBreakUseCase
 * 休憩更新のユースケース
 */
export class UpdateShiftBreakUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(
    dto: UpdateShiftBreakDTO
  ): Promise<Result<ShiftBreak>> {
    try {
      // バリデーション
      if (!dto.breakId || dto.breakId <= 0) {
        return R.failure(
          new ValidationError('休憩IDが無効です', 'breakId')
        )
      }

      // 既存の休憩を取得
      const shiftBreak = await this.shiftRepository.findBreakById(dto.breakId)

      if (!shiftBreak) {
        return R.failure(
          new NotFoundError('休憩', dto.breakId)
        )
      }

      let updatedBreak = shiftBreak

      if (dto.breakStart) {
        const start = new Date(dto.breakStart)
        if (isNaN(start.getTime())) {
          return R.failure(
            new ValidationError('無効な開始時刻形式です', 'breakStart')
          )
        }
        updatedBreak = updatedBreak.updateBreakStart(start)
      }

      if (dto.breakEnd) {
        const end = new Date(dto.breakEnd)
        if (isNaN(end.getTime())) {
          return R.failure(
            new ValidationError('無効な終了時刻形式です', 'breakEnd')
          )
        }
        updatedBreak = updatedBreak.updateBreakEnd(end)
      }

      // 開始時刻と終了時刻の整合性チェック
      if (updatedBreak.breakStart >= updatedBreak.breakEnd) {
        return R.failure(
          new BusinessLogicError('開始時刻は終了時刻より前である必要があります')
        )
      }

      const result = await this.shiftRepository.updateShiftBreak(updatedBreak)

      return R.success(result)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '休憩の更新に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


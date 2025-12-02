import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { ShiftBreak } from '@/domain/shift/entities/shift-break'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * GetShiftBreaksUseCase
 * シフトの休憩一覧を取得するユースケース
 */
export class GetShiftBreaksUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(shiftId: number): Promise<Result<ShiftBreak[]>> {
    try {
      // バリデーション
      if (!shiftId || shiftId <= 0) {
        return R.failure(
          new ValidationError('シフトIDが無効です', 'shiftId')
        )
      }

      const breaks = await this.shiftRepository.findShiftBreaks(shiftId)

      return R.success(breaks)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '休憩一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


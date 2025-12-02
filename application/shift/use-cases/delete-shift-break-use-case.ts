import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * DeleteShiftBreakUseCase
 * 休憩削除のユースケース
 */
export class DeleteShiftBreakUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(breakId: number): Promise<Result<{ success: boolean }>> {
    try {
      // バリデーション
      if (!breakId || breakId <= 0) {
        return R.failure(
          new ValidationError('休憩IDが無効です', 'breakId')
        )
      }

      // 削除前に存在確認
      const shiftBreak = await this.shiftRepository.findBreakById(breakId)
      if (!shiftBreak) {
        return R.failure(
          new NotFoundError('休憩', breakId)
        )
      }

      await this.shiftRepository.deleteShiftBreak(breakId)

      return R.success({ success: true })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          '休憩の削除に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


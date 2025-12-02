import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Result, Result as R } from '@/domain/common/result'
import { NotFoundError, ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * DeleteShiftUseCase
 * シフト削除のユースケース
 */
export class DeleteShiftUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(shiftId: number): Promise<Result<{ success: boolean; storeId?: number }>> {
    try {
      // バリデーション
      if (!shiftId || shiftId <= 0) {
        return R.failure(
          new ValidationError('シフトIDが無効です', 'shiftId')
        )
      }

      // 削除前にstoreIdを取得（キャッシュ無効化用）
      const shift = await this.shiftRepository.findById(shiftId)

      if (!shift) {
        return R.failure(
          new NotFoundError('シフト', shiftId)
        )
      }

      await this.shiftRepository.deleteShift(shiftId)

      return R.success({ success: true, storeId: shift.storeId })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'シフトの削除に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Shift } from '@/domain/shift/entities/shift'
import { Result, Result as R } from '@/domain/common/result'
import { DatabaseError, ValidationError } from '@/domain/common/errors'

/**
 * GetUserShiftsUseCase
 * ユーザーのシフト一覧を取得するユースケース
 */
export class GetUserShiftsUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(
    userId: string,
    startDate: string,
    endDate: string,
    storeId?: number
  ): Promise<Result<Shift[]>> {
    try {
      // バリデーション
      if (!userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      if (!startDate || !endDate) {
        return R.failure(
          new ValidationError('開始日と終了日を指定してください', 'dateRange')
        )
      }

      const start = new Date(`${startDate}T00:00:00`)
      const end = new Date(`${endDate}T23:59:59`)

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

      const shifts = await this.shiftRepository.findUserShifts(
        userId,
        start,
        end,
        storeId
      )

      return R.success(shifts)
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'シフト一覧の取得に失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }
}


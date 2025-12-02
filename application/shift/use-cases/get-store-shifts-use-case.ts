import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Shift } from '@/domain/shift/entities/shift'
import { Result, Result as R } from '@/domain/common/result'
import { DatabaseError, ValidationError } from '@/domain/common/errors'

/**
 * GetStoreShiftsUseCase
 * 店舗のシフト一覧を取得するユースケース
 */
export class GetStoreShiftsUseCase {
  constructor(private readonly shiftRepository: IShiftRepository) {}

  async execute(
    storeId: number,
    startDate: string,
    endDate: string
  ): Promise<Result<Shift[]>> {
    try {
      // バリデーション
      if (!storeId || storeId <= 0) {
        return R.failure(
          new ValidationError('店舗IDが無効です', 'storeId')
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

      const shifts = await this.shiftRepository.findStoreShifts(
        storeId,
        start,
        end
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


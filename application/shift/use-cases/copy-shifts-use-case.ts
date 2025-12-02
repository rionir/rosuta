import { IShiftRepository } from '@/domain/shift/repositories/shift-repository'
import { Shift } from '@/domain/shift/entities/shift'
import { ShiftBreak } from '@/domain/shift/entities/shift-break'
import { CopyShiftsDTO } from '../dto/copy-shifts-dto'
import { SupabaseClient } from '@supabase/supabase-js'
import { Result, Result as R } from '@/domain/common/result'
import { ValidationError, DatabaseError } from '@/domain/common/errors'

/**
 * CopyShiftsUseCase
 * シフトをコピーするユースケース（日/週/月コピー機能）
 */
export class CopyShiftsUseCase {
  constructor(
    private readonly shiftRepository: IShiftRepository,
    private readonly supabase: SupabaseClient
  ) {}

  async execute(
    dto: CopyShiftsDTO
  ): Promise<Result<{ copied: number; skipped: number }>> {
    try {
      // バリデーション
      if (!dto.sourceDate || !dto.targetDate) {
        return R.failure(
          new ValidationError('コピー元日付とコピー先日付を指定してください', 'dateRange')
        )
      }

      if (!dto.userId) {
        return R.failure(
          new ValidationError('ユーザーIDが指定されていません', 'userId')
        )
      }

      const sourceDate = new Date(dto.sourceDate)
      const targetDate = new Date(dto.targetDate)

      if (isNaN(sourceDate.getTime()) || isNaN(targetDate.getTime())) {
        return R.failure(
          new ValidationError('無効な日付形式です', 'dateRange')
        )
      }

      // コピー元のシフトを取得
      const sourceShifts = await this.shiftRepository.findShiftsByDateRange(
        sourceDate,
        dto.storeId
      )

      if (sourceShifts.length === 0) {
        return R.success({ copied: 0, skipped: 0 })
      }

      // コピー先の既存シフトを確認
      const existingShifts = await this.shiftRepository.findShiftsByDateRange(
        targetDate,
        dto.storeId
      )

      const existingShiftMap = new Map(
        existingShifts.map((s) => [`${s.userId}-${s.storeId}`, s.id])
      )

      let copied = 0
      let skipped = 0

      // 各シフトをコピー
      for (const sourceShift of sourceShifts) {
        const key = `${sourceShift.userId}-${sourceShift.storeId}`
        const existingId = existingShiftMap.get(key)

        if (existingId && !dto.overwrite) {
          skipped++
          continue
        }

        // 日付を変更
        const dateDiff = targetDate.getTime() - sourceDate.getTime()
        const newStart = new Date(
          sourceShift.scheduledStart.getTime() + dateDiff
        )
        const newEnd = new Date(sourceShift.scheduledEnd.getTime() + dateDiff)

        // 夜勤の場合、終了日を翌日に設定
        if (newEnd < newStart) {
          newEnd.setDate(newEnd.getDate() + 1)
        }

        if (existingId && dto.overwrite) {
          // 既存シフトを更新
          const existingShift = await this.shiftRepository.findById(existingId)
          if (!existingShift) {
            skipped++
            continue
          }
          const updatedShift = existingShift.updateScheduledTime(newStart, newEnd)
          await this.shiftRepository.updateShift(updatedShift)

          // 休憩もコピー
          await this.copyShiftBreaks(sourceShift.id, existingId, dateDiff)

          copied++
        } else {
          // 新規シフトを作成
          const newShift = new Shift(
            0,
            sourceShift.userId,
            sourceShift.storeId,
            newStart,
            newEnd,
            dto.userId,
            new Date(),
            new Date()
          )

          const createdShift = await this.shiftRepository.createShift(newShift)

          // 休憩もコピー
          await this.copyShiftBreaks(
            sourceShift.id,
            createdShift.id,
            dateDiff
          )

          copied++
        }
      }

      // 操作記録を保存
      await this.supabase.from('shift_copies').insert({
        user_id: dto.userId,
        source_date: dto.sourceDate,
        target_date: dto.targetDate,
        overwrite: dto.overwrite,
      })

      return R.success({ copied, skipped })
    } catch (error) {
      return R.failure(
        new DatabaseError(
          'シフトのコピーに失敗しました',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  }

  private async copyShiftBreaks(
    sourceShiftId: number,
    targetShiftId: number,
    dateDiff: number
  ): Promise<void> {
    const sourceBreaks = await this.shiftRepository.findShiftBreaks(
      sourceShiftId
    )

    if (sourceBreaks.length === 0) {
      return
    }

    // 既存の休憩を削除（上書きの場合）
    const existingBreaks = await this.shiftRepository.findShiftBreaks(
      targetShiftId
    )
    for (const breakItem of existingBreaks) {
      await this.shiftRepository.deleteShiftBreak(breakItem.id)
    }

    // 休憩をコピー（日付部分を変更）
    for (const sourceBreak of sourceBreaks) {
      const newBreakStart = new Date(
        sourceBreak.breakStart.getTime() + dateDiff
      )
      const newBreakEnd = new Date(sourceBreak.breakEnd.getTime() + dateDiff)

      // 夜勤の場合、終了時刻を翌日に設定
      if (newBreakEnd < newBreakStart) {
        newBreakEnd.setDate(newBreakEnd.getDate() + 1)
      }

      const newBreak = new ShiftBreak(
        0,
        targetShiftId,
        newBreakStart,
        newBreakEnd,
        new Date(),
        new Date()
      )

      await this.shiftRepository.createShiftBreak(newBreak)
    }
  }
}


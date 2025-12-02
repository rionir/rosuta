import { ShiftBreakDTO } from '@/presentation/shift/dto/shift-dto'

/**
 * ShiftBreakエンティティ
 * 休憩予定を表す
 */
export class ShiftBreak {
  constructor(
    public readonly id: number,
    public readonly shiftId: number,
    public readonly breakStart: Date,
    public readonly breakEnd: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 休憩開始時刻を更新
   */
  updateBreakStart(breakStart: Date): ShiftBreak {
    return new ShiftBreak(
      this.id,
      this.shiftId,
      breakStart,
      this.breakEnd,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 休憩終了時刻を更新
   */
  updateBreakEnd(breakEnd: Date): ShiftBreak {
    return new ShiftBreak(
      this.id,
      this.shiftId,
      this.breakStart,
      breakEnd,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 休憩時刻を更新
   */
  updateBreakTime(breakStart: Date, breakEnd: Date): ShiftBreak {
    return new ShiftBreak(
      this.id,
      this.shiftId,
      breakStart,
      breakEnd,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): ShiftBreakDTO {
    return {
      id: this.id,
      shift_id: this.shiftId,
      break_start: this.breakStart.toISOString(),
      break_end: this.breakEnd.toISOString(),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


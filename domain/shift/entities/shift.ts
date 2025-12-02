import type { ShiftDTO } from '@/presentation/shift/dto/shift-dto'

/**
 * Shiftエンティティ
 * シフト予定を表す
 */
export class Shift {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly storeId: number,
    public readonly scheduledStart: Date,
    public readonly scheduledEnd: Date,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 予定開始時刻を更新
   */
  updateScheduledStart(scheduledStart: Date): Shift {
    return new Shift(
      this.id,
      this.userId,
      this.storeId,
      scheduledStart,
      this.scheduledEnd,
      this.createdBy,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 予定終了時刻を更新
   */
  updateScheduledEnd(scheduledEnd: Date): Shift {
    return new Shift(
      this.id,
      this.userId,
      this.storeId,
      this.scheduledStart,
      scheduledEnd,
      this.createdBy,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 予定時刻を更新
   */
  updateScheduledTime(scheduledStart: Date, scheduledEnd: Date): Shift {
    return new Shift(
      this.id,
      this.userId,
      this.storeId,
      scheduledStart,
      scheduledEnd,
      this.createdBy,
      this.createdAt,
      new Date()
    )
  }

  /**
   * DTOに変換
   */
  toDTO(): ShiftDTO {
    return {
      id: this.id,
      user_id: this.userId,
      store_id: this.storeId,
      scheduled_start: this.scheduledStart.toISOString(),
      scheduled_end: this.scheduledEnd.toISOString(),
      created_by: this.createdBy,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


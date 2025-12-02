import { ClockRecordType } from '../value-objects/clock-record-type'
import { ClockRecordMethod } from '../value-objects/clock-record-method'
import { ClockRecordStatus } from '../value-objects/clock-record-status'
import type { ClockRecordDTO } from '@/presentation/clock-record/dto/clock-record-dto'

/**
 * ClockRecordエンティティ
 * 打刻記録を表す
 */
export class ClockRecord {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly storeId: number,
    public readonly shiftId: number | null,
    public readonly breakId: number | null,
    public readonly type: ClockRecordType,
    public readonly selectedTime: Date,
    public readonly actualTime: Date,
    public readonly method: ClockRecordMethod,
    public readonly status: ClockRecordStatus,
    public readonly createdBy: string,
    public readonly approvedBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * 選択時刻を更新
   */
  updateSelectedTime(selectedTime: Date): ClockRecord {
    return new ClockRecord(
      this.id,
      this.userId,
      this.storeId,
      this.shiftId,
      this.breakId,
      this.type,
      selectedTime,
      this.actualTime,
      this.method,
      this.status,
      this.createdBy,
      this.approvedBy,
      this.createdAt,
      new Date()
    )
  }

  /**
   * ステータスを更新
   */
  updateStatus(
    status: ClockRecordStatus,
    approvedBy: string | null
  ): ClockRecord {
    return new ClockRecord(
      this.id,
      this.userId,
      this.storeId,
      this.shiftId,
      this.breakId,
      this.type,
      this.selectedTime,
      this.actualTime,
      this.method,
      status,
      this.createdBy,
      approvedBy,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 承認待ちに戻す（編集時）
   */
  resetToPending(): ClockRecord {
    return new ClockRecord(
      this.id,
      this.userId,
      this.storeId,
      this.shiftId,
      this.breakId,
      this.type,
      this.selectedTime,
      this.actualTime,
      this.method,
      ClockRecordStatus.PENDING,
      this.createdBy,
      null,
      this.createdAt,
      new Date()
    )
  }

  /**
   * 承認済みかどうか
   */
  isApproved(): boolean {
    return this.status === ClockRecordStatus.APPROVED
  }

  /**
   * 承認待ちかどうか
   */
  isPending(): boolean {
    return this.status === ClockRecordStatus.PENDING
  }

  /**
   * 却下されているかどうか
   */
  isRejected(): boolean {
    return this.status === ClockRecordStatus.REJECTED
  }

  /**
   * DTOに変換
   */
  toDTO(): ClockRecordDTO {
    return {
      id: this.id,
      user_id: this.userId,
      store_id: this.storeId,
      shift_id: this.shiftId,
      break_id: this.breakId,
      type: this.type,
      selected_time: this.selectedTime.toISOString(),
      actual_time: this.actualTime.toISOString(),
      method: this.method,
      status: this.status,
      created_by: this.createdBy,
      approved_by: this.approvedBy,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}


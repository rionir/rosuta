import { ClockRecordStatus } from '../value-objects/clock-record-status'

/**
 * ClockRecordService
 * 打刻記録に関するドメインサービス（ビジネスロジック）
 */
export class ClockRecordService {
  /**
   * 店舗設定に基づいて打刻記録の初期ステータスを決定
   */
  static determineInitialStatus(approvalRequired: boolean): ClockRecordStatus {
    return approvalRequired
      ? ClockRecordStatus.PENDING
      : ClockRecordStatus.APPROVED
  }

  /**
   * 承認制の場合、編集時にステータスをpendingに戻す必要があるかどうか
   */
  static shouldResetToPendingOnEdit(
    approvalRequired: boolean,
    currentStatus: ClockRecordStatus
  ): boolean {
    return (
      approvalRequired &&
      (currentStatus === ClockRecordStatus.APPROVED ||
        currentStatus === ClockRecordStatus.REJECTED)
    )
  }

  /**
   * 現在の勤務ステータスを判定
   */
  static determineWorkStatus(
    lastRecord: {
      type: string
      status: ClockRecordStatus
    } | null
  ): 'before_work' | 'working' | 'on_break' | 'finished' {
    if (!lastRecord) {
      return 'before_work'
    }

    // 承認済みまたは承認待ちのレコードを考慮
    switch (lastRecord.type) {
      case 'clock_in':
        return 'working'
      case 'break_start':
        return 'on_break'
      case 'break_end':
        return 'working'
      case 'clock_out':
        return 'finished'
      default:
        return 'before_work'
    }
  }
}


/**
 * ClockRecordStatus値オブジェクト
 * 打刻ステータスのバリデーションと不変性を保証
 */
export enum ClockRecordStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * ClockRecordStatusの文字列から値オブジェクトに変換
 */
export function createClockRecordStatus(value: string): ClockRecordStatus {
  if (!Object.values(ClockRecordStatus).includes(value as ClockRecordStatus)) {
    throw new Error(`Invalid clock record status: ${value}`)
  }
  return value as ClockRecordStatus
}


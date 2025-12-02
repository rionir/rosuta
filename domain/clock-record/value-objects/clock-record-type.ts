/**
 * ClockRecordType値オブジェクト
 * 打刻種類のバリデーションと不変性を保証
 */
export enum ClockRecordType {
  CLOCK_IN = 'clock_in',
  CLOCK_OUT = 'clock_out',
  BREAK_START = 'break_start',
  BREAK_END = 'break_end',
}

/**
 * ClockRecordTypeの文字列から値オブジェクトに変換
 */
export function createClockRecordType(value: string): ClockRecordType {
  if (!Object.values(ClockRecordType).includes(value as ClockRecordType)) {
    throw new Error(`Invalid clock record type: ${value}`)
  }
  return value as ClockRecordType
}


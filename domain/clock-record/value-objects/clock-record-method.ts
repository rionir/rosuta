/**
 * ClockRecordMethod値オブジェクト
 * 打刻方法のバリデーションと不変性を保証
 */
export enum ClockRecordMethod {
  SCHEDULED = 'scheduled',
  CURRENT = 'current',
  MANUAL = 'manual',
}

/**
 * ClockRecordMethodの文字列から値オブジェクトに変換
 */
export function createClockRecordMethod(value: string): ClockRecordMethod {
  if (!Object.values(ClockRecordMethod).includes(value as ClockRecordMethod)) {
    throw new Error(`Invalid clock record method: ${value}`)
  }
  return value as ClockRecordMethod
}


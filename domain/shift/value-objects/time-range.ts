/**
 * TimeRange値オブジェクト
 * 時刻範囲のバリデーションと不変性を保証
 */
export class TimeRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    if (start >= end && !this.isOvernightShift(start, end)) {
      throw new Error('Start time must be before end time')
    }
  }

  /**
   * 夜勤シフトかどうかを判定
   * 終了時刻が開始時刻より前の場合、翌日のシフトとみなす
   */
  private isOvernightShift(start: Date, end: Date): boolean {
    // 終了時刻が開始時刻より前の場合、夜勤シフトとみなす
    // ただし、日付が異なる場合のみ（同じ日の場合はエラー）
    return end < start && end.getDate() !== start.getDate()
  }

  /**
   * 時刻範囲の長さ（ミリ秒）を取得
   */
  getDuration(): number {
    if (this.end < this.start) {
      // 夜勤シフトの場合、翌日までの時間を計算
      const nextDay = new Date(this.end)
      nextDay.setDate(nextDay.getDate() + 1)
      return nextDay.getTime() - this.start.getTime()
    }
    return this.end.getTime() - this.start.getTime()
  }

  /**
   * 時刻範囲の長さ（時間）を取得
   */
  getDurationInHours(): number {
    return this.getDuration() / (1000 * 60 * 60)
  }
}


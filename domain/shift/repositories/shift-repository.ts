import { Shift } from '../entities/shift'
import { ShiftBreak } from '../entities/shift-break'

/**
 * Shiftリポジトリインターフェース
 * シフトと休憩の永続化を抽象化
 */
export interface IShiftRepository {
  /**
   * シフトを作成
   */
  createShift(shift: Shift): Promise<Shift>

  /**
   * シフトを更新
   */
  updateShift(shift: Shift): Promise<Shift>

  /**
   * シフトを削除
   */
  deleteShift(shiftId: number): Promise<void>

  /**
   * シフトIDでシフトを取得
   */
  findById(shiftId: number): Promise<Shift | null>

  /**
   * ユーザーのシフト一覧を取得（日付範囲指定）
   */
  findUserShifts(
    userId: string,
    startDate: Date,
    endDate: Date,
    storeId?: number
  ): Promise<Shift[]>

  /**
   * 店舗のシフト一覧を取得（日付範囲指定）
   */
  findStoreShifts(
    storeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Shift[]>

  /**
   * 休憩を作成
   */
  createShiftBreak(shiftBreak: ShiftBreak): Promise<ShiftBreak>

  /**
   * 休憩を更新
   */
  updateShiftBreak(shiftBreak: ShiftBreak): Promise<ShiftBreak>

  /**
   * 休憩を削除
   */
  deleteShiftBreak(breakId: number): Promise<void>

  /**
   * シフトの休憩一覧を取得
   */
  findShiftBreaks(shiftId: number): Promise<ShiftBreak[]>

  /**
   * 休憩IDで休憩を取得
   */
  findBreakById(breakId: number): Promise<ShiftBreak | null>

  /**
   * 日付範囲でシフトを取得（コピー用）
   */
  findShiftsByDateRange(
    date: Date,
    storeId?: number
  ): Promise<Shift[]>
}

